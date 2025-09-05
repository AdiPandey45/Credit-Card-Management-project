import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { logger } from '../config/logger';
import { NotFoundError, ValidationError, ForbiddenError } from '../middleware/errorHandler';
import { createPaymentSuccessNotification, createPaymentFailedNotification } from '../utils/notifications';

const router = Router();

// Validation schemas
const createPaymentSchema = z.object({
  cardId: z.number().int().positive(),
  amount: z.number().positive().max(1000000, 'Amount cannot exceed ₹10,00,000'),
  method: z.enum(['bank', 'card', 'instant']),
});

const paymentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED']).optional(),
  cardId: z.string().optional().transform(val => val ? parseInt(val) : undefined),
});

const webhookSchema = z.object({
  paymentId: z.string(),
  status: z.enum(['SUCCESS', 'FAILED']),
  externalId: z.string().optional(),
});

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardId
 *               - amount
 *               - method
 *             properties:
 *               cardId:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 1000000
 *               method:
 *                 type: string
 *                 enum: [bank, card, instant]
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/', authenticate, validateBody(createPaymentSchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { cardId, amount, method } = req.body;

    // Verify card ownership
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId,
      },
    });

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    if (card.status !== 'ACTIVE') {
      throw new ForbiddenError('Card is not active');
    }

    // Get outstanding balance
    const statements = await prisma.statement.findMany({
      where: {
        cardId,
        isPaid: false,
      },
    });

    const outstandingBalance = statements.reduce((sum, statement) => sum + statement.balance, 0);

    if (amount > outstandingBalance) {
      throw new ValidationError(`Payment amount (₹${amount.toLocaleString()}) cannot exceed outstanding balance (₹${outstandingBalance.toLocaleString()})`);
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        cardId,
        userId,
        amount,
        method,
        status: 'PENDING',
      },
    });

    // Mock payment processing
    const isSuccess = Math.random() > 0.05; // 95% success rate
    const finalStatus = isSuccess ? 'SUCCESS' : 'FAILED';

    // Simulate processing delay
    setTimeout(async () => {
      try {
        await processPayment(payment.id, finalStatus, card.last4, userId, amount);
      } catch (error) {
        logger.error('Payment processing error:', error);
      }
    }, 1000 + Math.random() * 2000);

    logger.info(`Payment created: ${payment.id} for card ${cardId} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        timestamp: payment.createdAt,
      },
      message: 'Payment initiated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get user's payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED]
 *       - in: query
 *         name: cardId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 */
router.get('/', authenticate, validateQuery(paymentQuerySchema), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { page, limit, status, cardId } = req.query as any;

    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;
    if (cardId) where.cardId = cardId;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          card: {
            select: {
              last4: true,
              cardType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      data: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status.toLowerCase(),
        card: {
          last4: payment.card.last4,
          cardType: payment.card.cardType,
        },
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Payment webhook endpoint
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *               - status
 *             properties:
 *               paymentId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [SUCCESS, FAILED]
 *               externalId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook', validateBody(webhookSchema), async (req, res, next) => {
  try {
    const { paymentId, status, externalId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        card: {
          select: {
            last4: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    await processPayment(paymentId, status, payment.card.last4, payment.userId, payment.amount, externalId);

    res.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to process payment
async function processPayment(
  paymentId: string,
  status: 'SUCCESS' | 'FAILED',
  cardLast4: string,
  userId: number,
  amount: number,
  externalId?: string
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          externalId,
        },
      });

      if (status === 'SUCCESS') {
        // Update statements - pay off oldest statements first
        const statements = await tx.statement.findMany({
          where: {
            cardId: updatedPayment.cardId,
            isPaid: false,
          },
          orderBy: {
            dueDate: 'asc',
          },
        });

        let remainingAmount = amount;
        for (const statement of statements) {
          if (remainingAmount <= 0) break;

          if (remainingAmount >= statement.balance) {
            // Pay off entire statement
            await tx.statement.update({
              where: { id: statement.id },
              data: {
                isPaid: true,
                balance: 0,
              },
            });
            remainingAmount -= statement.balance;
          } else {
            // Partial payment
            await tx.statement.update({
              where: { id: statement.id },
              data: {
                balance: statement.balance - remainingAmount,
              },
            });
            remainingAmount = 0;
          }
        }

        // Send success notification
        await createPaymentSuccessNotification(userId, amount, cardLast4);
      } else {
        // Send failure notification
        await createPaymentFailedNotification(userId, amount, cardLast4);
      }
    });

    logger.info(`Payment ${paymentId} processed with status ${status}`);
  } catch (error) {
    logger.error(`Error processing payment ${paymentId}:`, error);
    throw error;
  }
}

export default router;