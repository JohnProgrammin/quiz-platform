-- Coupon System Migration
-- Allows users to redeem codes for 8-hour Premium trial access

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  UNIQUE(user_id, coupon_id)
);

CREATE INDEX idx_coupon_code ON coupons(code);
CREATE INDEX idx_coupon_active ON coupons(is_active) WHERE is_active = true;
CREATE INDEX idx_user_coupon_user ON user_coupon_usage(user_id);
CREATE INDEX idx_user_coupon_expires ON user_coupon_usage(expires_at);

-- Insert sample coupons (these can be managed later via admin panel)
INSERT INTO coupons (code, max_uses, is_active) VALUES
  ('FLORA8HOUR', 999, true),
  ('PREMIUM7DAYS', 50, true),
  ('BETA2024', 100, true)
ON CONFLICT (code) DO NOTHING;
