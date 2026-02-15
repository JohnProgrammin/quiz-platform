/**
 * Coupon Routes
 * /api/v1/coupons
 */

const express = require('express');
const router = express.Router();
const couponService = require('../services/coupon.service');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/v1/coupons/redeem
 * Redeem a coupon code for 8-hour trial access
 */
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Coupon code is required',
      });
    }

    const result = await couponService.redeemCoupon(req.user.id, code);

    if (!result.success) {
      return res.status(400).json({
        error: result.message,
      });
    }

    res.json({
      message: result.message,
      expiresAt: result.expiresAt,
      hoursRemaining: result.hoursRemaining,
    });
  } catch (error) {
    console.error('Coupon redemption error:', error);
    res.status(500).json({
      error: 'Failed to redeem coupon',
    });
  }
});

/**
 * GET /api/v1/coupons/trial-status
 * Get user's current trial status
 */
router.get('/trial-status', authenticateToken, async (req, res) => {
  try {
    const status = await couponService.getTrialStatus(req.user.id);

    res.json(status);
  } catch (error) {
    console.error('Trial status error:', error);
    res.status(500).json({
      error: 'Failed to fetch trial status',
    });
  }
});

/**
 * GET /api/v1/coupons/list (admin only)
 * Get all coupons
 */
router.get('/list', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin check
    const coupons = await couponService.getAllCoupons();

    res.json({
      coupons,
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      error: 'Failed to fetch coupons',
    });
  }
});

/**
 * POST /api/v1/coupons/create (admin only)
 * Create a new coupon
 */
router.post('/create', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin check
    const { code, maxUses } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Coupon code is required',
      });
    }

    const result = await couponService.createCoupon(code, maxUses || 1);

    if (!result.success) {
      return res.status(400).json({
        error: result.message,
      });
    }

    res.json({
      message: 'Coupon created successfully',
      coupon: result.coupon,
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      error: 'Failed to create coupon',
    });
  }
});

module.exports = router;
