import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Pay credit card bill
router.post('/:cardId/pay', authenticate, async (req: AuthRequest, res) => {
  const { cardId } = req.params;
  const { amount, method } = req.body;
  const payment = await prisma.payment.create({
    data: {
      cardId: Number(cardId),
      userId: req.userId!,
      amount: Number(amount),
      method,
      status: 'COMPLETED',
    },
  });
  res.json(payment);
});

// Enable/disable autopay
router.post('/:cardId/autopay', authenticate, async (req: AuthRequest, res) => {
  const { cardId } = req.params;
  const { enabled } = req.body;
  const card = await prisma.card.update({
    where: { id: Number(cardId) },
    data: { autopayEnabled: !!enabled },
  });
  res.json(card);
});

export default router;
