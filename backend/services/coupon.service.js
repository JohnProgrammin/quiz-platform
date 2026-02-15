/**
 * Coupon Service
 * Handles coupon validation and redemption for trial access
 */

const sql = require('../db');

class CouponService {
  /**
   * Validate and redeem coupon code
   * @param {string} userId - User ID
   * @param {string} code - Coupon code to redeem
   * @returns {Promise<{success: boolean, message: string, expiresAt?: Date, hoursRemaining?: number}>}
   */
  async redeemCoupon(userId, code) {
    try {
      // Check if user already has an active trial
      const activeTrialCheck = await sql`
        SELECT expires_at FROM user_coupon_usage
        WHERE user_id = ${userId} AND expires_at > NOW()
      `;

      if (activeTrialCheck.length > 0) {
        const expiresAt = new Date(activeTrialCheck[0].expires_at);
        const hoursRemaining = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60));
        return {
          success: false,
          message: `You already have an active trial that expires in ${hoursRemaining} hours`,
          hoursRemaining,
        };
      }

      // Check if coupon exists and is active
      const couponCheck = await sql`
        SELECT id, code, max_uses, used_count FROM coupons
        WHERE code = ${code.toUpperCase()} AND is_active = true
      `;

      if (couponCheck.length === 0) {
        return {
          success: false,
          message: 'Invalid or expired coupon code',
        };
      }

      const coupon = couponCheck[0];

      // Check if coupon has uses remaining
      if (coupon.used_count >= coupon.max_uses) {
        return {
          success: false,
          message: 'This coupon has reached its usage limit',
        };
      }

      // Check if user has already used this coupon
      const userUsageCheck = await sql`
        SELECT id FROM user_coupon_usage
        WHERE user_id = ${userId} AND coupon_id = ${coupon.id}
      `;

      if (userUsageCheck.length > 0) {
        return {
          success: false,
          message: 'You have already used this coupon code',
        };
      }

      // Calculate expiry time (8 hours from now)
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

      // Redeem the coupon
      await sql`
        INSERT INTO user_coupon_usage (user_id, coupon_id, expires_at)
        VALUES (${userId}, ${coupon.id}, ${expiresAt})
      `;

      // Update coupon usage count
      await sql`
        UPDATE coupons SET used_count = used_count + 1
        WHERE id = ${coupon.id}
      `;

      return {
        success: true,
        message: 'Coupon redeemed! You now have access to Premium for 8 hours',
        expiresAt,
        hoursRemaining: 8,
      };
    } catch (error) {
      console.error('❌ Coupon redemption error:', error.message);
      return {
        success: false,
        message: 'Failed to redeem coupon. Please try again.',
      };
    }
  }

  /**
   * Check user's active trial status
   * @param {string} userId - User ID
   * @returns {Promise<{hasActiveTrial: boolean, expiresAt?: Date, hoursRemaining?: number, minutesRemaining?: number}>}
   */
  async getTrialStatus(userId) {
    try {
      const result = await sql`
        SELECT expires_at FROM user_coupon_usage
        WHERE user_id = ${userId} AND expires_at > NOW()
        ORDER BY expires_at DESC
        LIMIT 1
      `;

      if (result.length === 0) {
        return {
          hasActiveTrial: false,
        };
      }

      const expiresAt = new Date(result[0].expires_at);
      const now = new Date();
      const msRemaining = expiresAt - now;
      const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        hasActiveTrial: true,
        expiresAt,
        hoursRemaining,
        minutesRemaining,
      };
    } catch (error) {
      console.error('❌ Trial status check error:', error.message);
      return {
        hasActiveTrial: false,
      };
    }
  }

  /**
   * Get all available coupon codes (admin only)
   * @returns {Promise<Array>}
   */
  async getAllCoupons() {
    try {
      return await sql`
        SELECT id, code, max_uses, used_count, is_active, created_at
        FROM coupons
        ORDER BY created_at DESC
      `;
    } catch (error) {
      console.error('❌ Get coupons error:', error.message);
      return [];
    }
  }

  /**
   * Create new coupon (admin only)
   * @param {string} code - Coupon code
   * @param {number} maxUses - Maximum number of uses
   * @returns {Promise<{success: boolean, coupon?: object}>}
   */
  async createCoupon(code, maxUses = 1) {
    try {
      const result = await sql`
        INSERT INTO coupons (code, max_uses, is_active)
        VALUES (${code.toUpperCase()}, ${maxUses}, true)
        RETURNING id, code, max_uses, is_active
      `;

      return {
        success: true,
        coupon: result[0],
      };
    } catch (error) {
      console.error('❌ Create coupon error:', error.message);
      return {
        success: false,
        message: error.message.includes('duplicate') ? 'Coupon code already exists' : 'Failed to create coupon',
      };
    }
  }

  /**
   * Deactivate coupon (admin only)
   * @param {string} couponId - Coupon ID
   * @returns {Promise<{success: boolean}>}
   */
  async deactivateCoupon(couponId) {
    try {
      await sql`
        UPDATE coupons SET is_active = false WHERE id = ${couponId}
      `;

      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Deactivate coupon error:', error.message);
      return {
        success: false,
      };
    }
  }
}

module.exports = new CouponService();
