import { Router } from 'express';
import multer from 'multer';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Apply for a new card
router.post('/applications', authenticate, upload.single('document'), async (req: AuthRequest, res) => {
  const { fullName, email, pan, income, product } = req.body;
  const document = req.file?.path;
  const application = await prisma.cardApplication.create({
    data: {
      userId: req.userId!,
      fullName,
      email,
      pan,
      income: Number(income),
      product,
      document,
    },
  });
  res.json(application);
});

// Track application status
router.get('/applications/:id', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const application = await prisma.cardApplication.findFirst({
    where: { id: Number(id), userId: req.userId },
  });
  if (!application) return res.status(404).json({ error: 'Not found' });
  res.json(application);
});

// Activate card
router.post('/:id/activate', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const card = await prisma.card.update({
    where: { id: Number(id) },
    data: { status: 'ACTIVE' },
  });
  res.json(card);
});

// Block card
router.post('/:id/block', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const card = await prisma.card.update({
    where: { id: Number(id) },
    data: { status: 'BLOCKED' },
  });
  res.json(card);
});

// Unblock card
router.post('/:id/unblock', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const card = await prisma.card.update({
    where: { id: Number(id) },
    data: { status: 'ACTIVE' },
  });
  res.json(card);
});

export default router;
