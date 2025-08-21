const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// GET /accounts - Get user's card accounts
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT id, card_number, card_type, credit_limit, outstanding_balance, available_credit
      FROM card_accounts 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    const accounts = result.rows.map(account => ({
      id: account.id,
      cardNumber: `****-****-****-${account.card_number.slice(-4)}`,
      cardType: account.card_type,
      creditLimit: account.credit_limit,
      outstandingBalance: account.outstanding_balance,
      availableCredit: account.available_credit
    }));

    res.json({
      success: true,
      data: accounts
    });

  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts'
    });
  }
});

// GET /accounts/:id - Get specific account details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT * FROM card_accounts 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const account = result.rows[0];

    res.json({
      success: true,
      data: {
        id: account.id,
        cardNumber: `****-****-****-${account.card_number.slice(-4)}`,
        cardType: account.card_type,
        creditLimit: account.credit_limit,
        outstandingBalance: account.outstanding_balance,
        availableCredit: account.available_credit,
        status: account.status
      }
    });

  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account details'
    });
  }
});

module.exports = router;