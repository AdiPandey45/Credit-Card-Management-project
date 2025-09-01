const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// PUT /cards/:id/block - Block/Unblock card
router.put('/:id/block', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { action } = req.body; // 'block' or 'unblock'
    const userId = req.user.id;

    // Validation
    if (!action || !['block', 'unblock'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "block" or "unblock"'
      });
    }

    // Check if card exists and belongs to user
    const cardQuery = `
      SELECT id, status, card_type, card_number
      FROM card_accounts 
      WHERE id = $1 AND user_id = $2
    `;
    const cardResult = await client.query(cardQuery, [id, userId]);

    if (cardResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Card not found or does not belong to user'
      });
    }

    const card = cardResult.rows[0];
    const newStatus = action === 'block' ? 'blocked' : 'active';

    // Check if action is valid based on current status
    if (action === 'block' && card.status === 'blocked') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Card is already blocked'
      });
    }

    if (action === 'unblock' && card.status === 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Card is already active'
      });
    }

    // Update card status
    const updateQuery = `
      UPDATE card_accounts 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, status, card_type, card_number
    `;

    const result = await client.query(updateQuery, [newStatus, id]);
    const updatedCard = result.rows[0];

    // Log the action in transactions table for audit trail
    const logQuery = `
      INSERT INTO transactions (id, account_id, user_id, amount, type, txn_time, merchant_name, status, description)
      VALUES (gen_random_uuid(), $1, $2, 0, 'system', NOW(), 'CreditFlow System', 'success', $3)
    `;

    const description = action === 'block' 
      ? 'Card temporarily blocked by user'
      : 'Card unblocked by user';

    await client.query(logQuery, [id, userId, description]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: action === 'block' 
        ? 'Card has been temporarily blocked' 
        : 'Card has been unblocked and is now active',
      data: {
        cardId: updatedCard.id,
        status: updatedCard.status,
        cardType: updatedCard.card_type,
        cardNumber: `****-****-****-${updatedCard.card_number.slice(-4)}`,
        action: action
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Card block/unblock error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to ${req.body.action} card`
    });
  } finally {
    client.release();
  }
});

// GET /cards/:id/status - Get card status
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT id, status, card_type, card_number, updated_at
      FROM card_accounts 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const card = result.rows[0];

    res.json({
      success: true,
      data: {
        cardId: card.id,
        status: card.status,
        cardType: card.card_type,
        cardNumber: `****-****-****-${card.card_number.slice(-4)}`,
        lastUpdated: card.updated_at
      }
    });

  } catch (error) {
    console.error('Get card status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch card status'
    });
  }
});

module.exports = router;