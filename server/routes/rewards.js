const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// GET /rewards - Get user's reward points and history
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total reward points
    const pointsQuery = `
      SELECT COALESCE(SUM(points_earned), 0) as total_points,
             COALESCE(SUM(points_redeemed), 0) as redeemed_points
      FROM reward_transactions 
      WHERE user_id = $1
    `;
    
    const pointsResult = await pool.query(pointsQuery, [userId]);
    const { total_points, redeemed_points } = pointsResult.rows[0];
    const available_points = total_points - redeemed_points;

    // Get recent reward transactions
    const historyQuery = `
      SELECT * FROM reward_transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const historyResult = await pool.query(historyQuery, [userId]);

    // Calculate next milestone
    const milestones = [1000, 2500, 5000, 10000, 25000, 50000];
    const nextMilestone = milestones.find(m => m > available_points) || null;
    const pointsToNext = nextMilestone ? nextMilestone - available_points : 0;

    res.json({
      success: true,
      data: {
        totalPoints: parseInt(total_points),
        redeemedPoints: parseInt(redeemed_points),
        availablePoints: parseInt(available_points),
        nextMilestone,
        pointsToNext,
        recentTransactions: historyResult.rows,
        redeemableOffers: [
          {
            id: 'cashback-500',
            title: '₹500 Cashback',
            description: 'Direct cashback to your account',
            pointsRequired: 5000,
            type: 'cashback',
            value: 500
          },
          {
            id: 'bill-discount-1000',
            title: '₹1000 Bill Discount',
            description: 'Apply as discount to your next bill',
            pointsRequired: 10000,
            type: 'bill_discount',
            value: 1000
          },
          {
            id: 'cashback-2500',
            title: '₹2500 Cashback',
            description: 'Premium cashback reward',
            pointsRequired: 25000,
            type: 'cashback',
            value: 2500
          }
        ]
      }
    });

  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards data'
    });
  }
});

// POST /rewards/redeem - Redeem reward points
router.post('/redeem', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { offerId, pointsRequired, rewardType, rewardValue } = req.body;
    const userId = req.user.id;

    // Validation
    if (!offerId || !pointsRequired || !rewardType || !rewardValue) {
      return res.status(400).json({
        success: false,
        message: 'Missing required redemption parameters'
      });
    }

    // Check available points
    const pointsQuery = `
      SELECT COALESCE(SUM(points_earned), 0) - COALESCE(SUM(points_redeemed), 0) as available_points
      FROM reward_transactions 
      WHERE user_id = $1
    `;
    
    const pointsResult = await client.query(pointsQuery, [userId]);
    const availablePoints = parseInt(pointsResult.rows[0].available_points);

    if (availablePoints < pointsRequired) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You have ${availablePoints} points but need ${pointsRequired} points.`
      });
    }

    // Create redemption transaction
    const redemptionId = `RDM_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const insertQuery = `
      INSERT INTO reward_transactions (id, user_id, transaction_type, points_redeemed, description, redemption_id, reward_type, reward_value)
      VALUES ($1, $2, 'redemption', $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const description = `Redeemed ${pointsRequired} points for ${rewardType === 'cashback' ? '₹' + rewardValue + ' cashback' : '₹' + rewardValue + ' bill discount'}`;

    await client.query(insertQuery, [
      uuidv4(),
      userId,
      pointsRequired,
      description,
      redemptionId,
      rewardType,
      rewardValue
    ]);

    // If bill discount, apply to outstanding balance
    if (rewardType === 'bill_discount') {
      await client.query(`
        UPDATE card_accounts 
        SET outstanding_balance = GREATEST(0, outstanding_balance - $1)
        WHERE user_id = $2
      `, [rewardValue, userId]);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Successfully redeemed ${pointsRequired} points for ₹${rewardValue} ${rewardType === 'cashback' ? 'cashback' : 'bill discount'}`,
      data: {
        redemptionId,
        pointsRedeemed: pointsRequired,
        rewardValue,
        rewardType,
        newAvailablePoints: availablePoints - pointsRequired
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Redeem rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem rewards'
    });
  } finally {
    client.release();
  }
});

module.exports = router;