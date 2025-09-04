import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get notifications
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(notifications);
});

// Update alert preferences
router.post('/preferences', authenticate, async (req: AuthRequest, res) => {
  const prefs = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { alertSettings: prefs },
  });
  res.json(user.alertSettings);
});

export default router;
