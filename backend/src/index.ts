import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/auth';
import cardRoutes from './routes/cards';
import cors from 'cors';
import transactionRoutes from './routes/transactions';
import paymentRoutes from './routes/payments';
import rewardRoutes from './routes/rewards';
import disputeRoutes from './routes/disputes';
import notificationRoutes from './routes/notifications';







dotenv.config();
console.log('DB=', process.env.DATABASE_URL);

const app = express();
app.use(express.json());
const origin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin, credentials: true }));


app.use('/auth', authRoutes);
app.use('/cards', cardRoutes);
app.use('/transactions', transactionRoutes);
app.use('/payments', paymentRoutes);
app.use('/rewards', rewardRoutes);
app.use('/disputes', disputeRoutes);
app.use('/notifications', notificationRoutes);


import path from 'path';
// Serve frontend static assets when in production / deployed together.
// Place built frontend `dist` into backend/public or adjust the path below.
const publicPath = process.env.FRONTEND_DIST_PATH || path.join(__dirname, '..', '..', 'Credit-Card-Management-project', 'dist');
if (process.env.SERVE_STATIC_FRONTEND === 'true') {
  app.use(express.static(publicPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

const port = process.env.PORT || 3000;
app.get("/api/health", (_req, res) => res.json({ ok: true })); //aug 21 add 10:36am
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
