const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CreditFlow API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock API routes for demo
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo login - accepts any credentials
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token: 'demo_jwt_token_' + Date.now(),
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        email: email
      }
    }
  });
});

// Import route modules
const authRoutes = require('./routes/auth');
const accountsRoutes = require('./routes/accounts');
const paymentsRoutes = require('./routes/payments');
const profileRoutes = require('./routes/profile');
const cardsRoutes = require('./routes/cards');
const rewardsRoutes = require('./routes/rewards');

// Use route modules
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/rewards', rewardsRoutes);

app.post('/api/payments', (req, res) => {
  const { accountId, amount, method } = req.body;
  
  // Simulate payment processing
  const isSuccess = Math.random() > 0.05; // 95% success rate
  
  if (isSuccess) {
    res.json({
      success: true,
      message: `Payment of ₹${amount.toLocaleString()} successful`,
      data: {
        paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount: amount,
        method: method,
        status: 'success',
        newBalance: 45320 - amount,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Payment gateway temporarily unavailable. Please try again.',
      data: {
        paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount: amount,
        method: method,
        status: 'failed',
        timestamp: new Date().toISOString()
      }
    });
  }
});

app.get('/api/accounts', (req, res) => {
  res.json({
    success: true,
    data: [{
      id: '660e8400-e29b-41d4-a716-446655440000',
      cardNumber: '****-****-****-9012',
      cardType: 'Platinum',
      creditLimit: 500000,
      outstandingBalance: 45320,
      availableCredit: 454680
    }]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 CreditFlow API Server Started
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health Check: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api
  `);
});

module.exports = app;