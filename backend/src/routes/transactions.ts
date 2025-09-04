import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Recent transactions for a card
router.get('/:cardId', authenticate, async (req: AuthRequest, res) => {
  const { cardId } = req.params;
  const txns = await prisma.transaction.findMany({
    where: { cardId: Number(cardId), userId: req.userId },
    orderBy: { date: 'desc' },
    take: 20,
  });
  res.json(txns);
});

// Download statement
router.get('/:cardId/statement', authenticate, async (req: AuthRequest, res) => {
  const { cardId } = req.params;
  const statement = await prisma.statement.findFirst({
    where: { cardId: Number(cardId) },
    orderBy: { createdAt: 'desc' },
  });
  if (!statement) return res.status(404).json({ error: 'Statement not found' });
  res.json(statement);
});

// Outstanding balance and due date
router.get('/:cardId/balance', authenticate, async (req: AuthRequest, res) => {
  const { cardId } = req.params;
  const statement = await prisma.statement.findFirst({
    where: { cardId: Number(cardId) },
    orderBy: { createdAt: 'desc' },
  });
  if (!statement) return res.status(404).json({ error: 'Statement not found' });
  res.json({ balance: statement.balance, dueDate: statement.dueDate });
});

export default router;
