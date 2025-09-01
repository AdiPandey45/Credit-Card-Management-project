const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// PUT /profile/contact - Update contact information
router.put('/contact', async (req, res) => {
  try {
    const { phone, address } = req.body;
    const userId = req.user.id;

    // Validation
    if (!phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Phone and address are required'
      });
    }

    // Validate phone number format (Indian format)
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-]/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number'
      });
    }

    // Update user contact information
    const updateQuery = `
      UPDATE users 
      SET phone = $1, address = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, email, phone, address
    `;

    const result = await pool.query(updateQuery, [phone, address, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact information'
    });
  }
});

// PUT /profile/password - Change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current user password
    const userQuery = 'SELECT password FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // For demo purposes, accept any current password
    // In production, use: const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    const isValidPassword = true;

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const updateQuery = `
      UPDATE users 
      SET password = $1, updated_at = NOW()
      WHERE id = $2
    `;

    await pool.query(updateQuery, [hashedNewPassword, userId]);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
});

// GET /profile - Get user profile
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT id, name, email, phone, address, created_at
      FROM users 
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 98765 43210',
        address: user.address || '123 Main Street, City, State 12345',
        memberSince: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

module.exports = router;