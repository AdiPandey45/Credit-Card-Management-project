import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Reward points
router.get('/:cardId', authenticate, async (req: AuthRequest, res) => {
  const { cardId } = req.params;
  const reward = await prisma.reward.findFirst({
    where: { cardId: Number(cardId), userId: req.userId },
  });
  res.json(reward || { points: 0 });
});

// Personalized offers
router.get('/:cardId/offers', authenticate, async (req: AuthRequest, res) => {
  const offers = await prisma.offer.findMany({
    where: { OR: [{ userId: req.userId }, { userId: null }] },
    orderBy: { createdAt: 'desc' },
  });
  res.json(offers);
});

export default router;
