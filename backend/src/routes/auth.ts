import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function signAccess(user: { id: number; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
}
function signRefresh(user: { id: number }) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },        // <- store hash only
      select: { id: true, email: true }
    });

    const accessToken = signAccess(user);
    res.json({ ...user, accessToken });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Login
// Login (robust: handles password or passwordHash, trims email, logs)
router.post('/login', async (req, res) => {
  try {
    const rawEmail = (req.body?.email ?? '') as string;
    const password = (req.body?.password ?? '') as string;

    const email = rawEmail.trim().toLowerCase();
    if (!email || !password) {
      return res.status(400).json({ error: 'email & password required' });
    }

    // Explicitly select fields we need in case of Prisma $extends/select middleware
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true as any, passwordHash: true as any },
    });

    console.log('LOGIN email:', email, 'user?', !!user, 'pwd_len:', user?.password?.length || 0, 'hash_len:', user?.passwordHash?.length || 0);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    let ok = false;

    // Preferred modern path
    if (user.passwordHash) {
      ok = await bcrypt.compare(password, user.passwordHash);
      console.log('COMPARE passwordHash:', ok);
    }
    // Legacy path (stored in `password`)
    if (!ok && user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        // already a bcrypt hash in legacy column
        ok = await bcrypt.compare(password, user.password);
        console.log('COMPARE legacy bcrypt password:', ok);
      } else {
        // truly plaintext legacy (unlikely here, but handle)
        ok = user.password === password;
        console.log('COMPARE legacy plaintext password:', ok);
      }
      // If legacy matched, upgrade to passwordHash for future logins
      if (ok && !user.passwordHash) {
        const newHash = await bcrypt.hash(password, 10);
        await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
        console.log('Upgraded user', user.id, 'to passwordHash');
      }
    }

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // Keep payload shape compatible with your middleware (expects { userId })
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    return res.json({ accessToken: token }); // standardized name
  } catch (e) {
    console.error('LOGIN ERROR:', e);
    return res.status(500).json({ error: 'server error' });
  }
});


// Request password reset (stub)
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body as { email: string };
  res.json({ message: `Password reset link sent to ${email}` });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body as { email: string; newPassword: string };
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  res.json({ message: 'Password updated' });
});

export default router;
