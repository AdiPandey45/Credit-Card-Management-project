const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all payment routes
router.use(authenticateToken);

// POST /payments - Create a new payment
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { accountId, amount, method } = req.body;
    const userId = req.user.id;

    // Validation
    if (!accountId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: accountId, amount, method'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    if (!['bank', 'card', 'instant'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be: bank, card, or instant'
      });
    }

    // Validate account exists and belongs to user
    const accountQuery = `
      SELECT id, user_id, outstanding_balance, credit_limit 
      FROM card_accounts 
      WHERE id = $1 AND user_id = $2
    `;
    const accountResult = await client.query(accountQuery, [accountId, userId]);

    if (accountResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Account not found or does not belong to user'
      });
    }

    const account = accountResult.rows[0];
    
    // Check if amount doesn't exceed outstanding balance
    if (amount > account.outstanding_balance) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${amount}) cannot exceed outstanding balance (₹${account.outstanding_balance})`
      });
    }

    // Generate unique payment ID
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Insert payment record with pending status
    const insertPaymentQuery = `
      INSERT INTO payments (id, account_id, payment_id, user_id, amount, method, status, payment_time)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING *
    `;
    
    const paymentResult = await client.query(insertPaymentQuery, [
      uuidv4(),
      accountId,
      paymentId,
      userId,
      amount,
      method
    ]);

    const payment = paymentResult.rows[0];

    // Simulate payment processing (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      // Update payment status to success
      await client.query(
        'UPDATE payments SET status = $1, external_id = $2 WHERE id = $3',
        ['success', `EXT_${Date.now()}`, payment.id]
      );

      // Create transaction record
      const insertTransactionQuery = `
        INSERT INTO transactions (id, account_id, user_id, amount, type, txn_time, merchant_name, status, description)
        VALUES ($1, $2, $3, $4, 'payment', NOW(), 'CreditFlow Payment', 'success', $5)
      `;
      
      await client.query(insertTransactionQuery, [
        uuidv4(),
        accountId,
        userId,
        -amount, // Negative amount for payment (reduces balance)
        `Payment via ${method}`
      ]);

      // Update outstanding balance
      const newBalance = account.outstanding_balance - amount;
      await client.query(
        'UPDATE card_accounts SET outstanding_balance = $1 WHERE id = $2',
        [newBalance, accountId]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Payment of ₹${amount.toLocaleString()} successful`,
        data: {
          paymentId: paymentId,
          amount: amount,
          method: method,
          status: 'success',
          newBalance: newBalance,
          timestamp: new Date().toISOString()
        }
      });

    } else {
      // Update payment status to failed
      await client.query(
        'UPDATE payments SET status = $1 WHERE id = $2',
        ['failed', payment.id]
      );

      await client.query('COMMIT');

      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
        data: {
          paymentId: paymentId,
          amount: amount,
          method: method,
          status: 'failed',
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// GET /payments/:id - Get payment details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT p.*, ca.card_number, ca.card_type
      FROM payments p
      JOIN card_accounts ca ON p.account_id = ca.id
      WHERE p.payment_id = $1 AND p.user_id = $2
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const payment = result.rows[0];
    
    res.json({
      success: true,
      data: {
        paymentId: payment.payment_id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        paymentTime: payment.payment_time,
        cardNumber: `****-****-****-${payment.card_number.slice(-4)}`,
        cardType: payment.card_type,
        externalId: payment.external_id
      }
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
});

// GET /payments/user/:userId - Get all payments for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    // Ensure user can only access their own payments
    if (userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const query = `
      SELECT p.*, ca.card_number, ca.card_type
      FROM payments p
      JOIN card_accounts ca ON p.account_id = ca.id
      WHERE p.user_id = $1
      ORDER BY p.payment_time DESC
      LIMIT 50
    `;

    const result = await pool.query(query, [userId]);

    const payments = result.rows.map(payment => ({
      paymentId: payment.payment_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      paymentTime: payment.payment_time,
      cardNumber: `****-****-****-${payment.card_number.slice(-4)}`,
      cardType: payment.card_type
    }));

    res.json({
      success: true,
      data: payments,
      count: payments.length
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

// GET /payments/:id/receipt - Get payment receipt
router.get('/:id/receipt', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT p.*, ca.card_number, ca.card_type, u.name, u.email
      FROM payments p
      JOIN card_accounts ca ON p.account_id = ca.id
      JOIN users u ON p.user_id = u.id
      WHERE p.payment_id = $1 AND p.user_id = $2 AND p.status = 'success'
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment receipt not found'
      });
    }

    const payment = result.rows[0];
    
    const receipt = {
      receiptId: `RCP_${payment.payment_id}`,
      paymentId: payment.payment_id,
      customerName: payment.name,
      customerEmail: payment.email,
      amount: payment.amount,
      method: payment.method,
      paymentTime: payment.payment_time,
      cardNumber: `****-****-****-${payment.card_number.slice(-4)}`,
      cardType: payment.card_type,
      externalId: payment.external_id,
      status: payment.status,
      companyName: 'CreditFlow',
      companyAddress: '123 Finance Street, Mumbai, India',
      supportEmail: 'support@creditflow.com'
    };

    res.json({
      success: true,
      data: receipt
    });

  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt'
    });
  }
});

// POST /payments/webhook - Simulate payment gateway webhook
router.post('/webhook', async (req, res) => {
  try {
    const { paymentId, status, externalId } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required webhook data'
      });
    }

    // Simulate 5 second delay
    setTimeout(async () => {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Update payment status
        const updateQuery = `
          UPDATE payments 
          SET status = $1, external_id = $2 
          WHERE payment_id = $3
          RETURNING *
        `;
        
        const result = await client.query(updateQuery, [status, externalId, paymentId]);
        
        if (result.rows.length > 0 && status === 'success') {
          const payment = result.rows[0];
          
          // Create transaction record
          await client.query(`
            INSERT INTO transactions (id, account_id, user_id, amount, type, txn_time, merchant_name, status, description)
            VALUES ($1, $2, $3, $4, 'payment', NOW(), 'CreditFlow Payment', 'success', $5)
          `, [
            uuidv4(),
            payment.account_id,
            payment.user_id,
            -payment.amount,
            `Webhook payment via ${payment.method}`
          ]);

          // Update outstanding balance
          await client.query(`
            UPDATE card_accounts 
            SET outstanding_balance = outstanding_balance - $1 
            WHERE id = $2
          `, [payment.amount, payment.account_id]);
        }

        await client.query('COMMIT');
        console.log(`✅ Webhook processed for payment ${paymentId}: ${status}`);
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Webhook processing error:', error);
      } finally {
        client.release();
      }
    }, 5000);

    res.json({
      success: true,
      message: 'Webhook received and will be processed'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

module.exports = router;