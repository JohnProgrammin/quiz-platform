/**
 * Email Service
 * Handles sending emails via SendGrid
 */

const http = require('https');

class EmailService {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@floraquiz.com';
  }

  /**
   * Send email via SendGrid API
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML email body
   */
  async sendEmail(to, subject, htmlContent) {
    if (!this.apiKey) {
      console.warn('⚠️  SendGrid API key not configured - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const data = JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { email: this.fromEmail },
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      });

      const options = {
        hostname: 'api.sendgrid.com',
        path: '/v3/mail/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      };

      return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let responseData = '';

          res.on('data', (chunk) => {
            responseData += chunk;
          });

          res.on('end', () => {
            if (res.statusCode === 202) {
              resolve({ success: true, message: 'Email sent successfully' });
            } else {
              console.error(`SendGrid error (${res.statusCode}):`, responseData);
              reject(new Error(`Email sending failed: ${res.statusCode}`));
            }
          });
        });

        req.on('error', (error) => {
          console.error('SendGrid request error:', error);
          reject(error);
        });

        req.write(data);
        req.end();
      });
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  /**
   * Send email verification link
   * @param {string} email - User email
   * @param {string} verificationToken - JWT verification token
   * @param {string} frontendUrl - Frontend base URL for verification link
   */
  async sendVerificationEmail(email, verificationToken, frontendUrl = process.env.FRONTEND_URL) {
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h1>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Welcome to FloraQuiz! Please verify your email address to complete your registration and unlock all features.
          </p>

          <div style="margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 30px 0 10px 0;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 0 0 30px 0;">
            ${verificationLink}
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This link will expire in 24 hours. If you didn't create a FloraQuiz account, please ignore this email.
          </p>
        </div>

        <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 20px;">
          © 2026 FloraQuiz. All rights reserved.
        </p>
      </div>
    `;

    return this.sendEmail(email, 'Verify Your FloraQuiz Email Address', htmlContent);
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} resetToken - JWT reset token
   * @param {string} frontendUrl - Frontend base URL
   */
  async sendPasswordResetEmail(email, resetToken, frontendUrl = process.env.FRONTEND_URL) {
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h1>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset your FloraQuiz password. Click the button below to create a new password.
          </p>

          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 30px 0 10px 0;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 0 0 30px 0;">
            ${resetLink}
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support.
          </p>
        </div>

        <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 20px;">
          © 2026 FloraQuiz. All rights reserved.
        </p>
      </div>
    `;

    return this.sendEmail(email, 'Reset Your FloraQuiz Password', htmlContent);
  }

  /**
   * Send subscription confirmation email
   * @param {string} email - User email
   * @param {string} tier - Subscription tier (pro, premium)
   * @param {number} amount - Amount in cents
   */
  async sendSubscriptionConfirmationEmail(email, tier, amount) {
    const displayAmount = (amount / 100).toFixed(2);
    const tierName = tier === 'pro' ? 'Pro' : 'Premium';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">🎉 Welcome to FloraQuiz ${tierName}!</h1>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for upgrading your FloraQuiz subscription! Your account has been updated with the following details:
          </p>

          <div style="background: #f3f4f6; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Plan:</strong> FloraQuiz ${tierName}</p>
            <p style="margin: 0 0 10px 0; color: #1f2937;"><strong>Amount:</strong> $${displayAmount} USD</p>
            <p style="margin: 0; color: #1f2937;"><strong>Status:</strong> Active</p>
          </div>

          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            You now have access to all ${tierName} features including unlimited quizzes, AI feedback, and more!
          </p>

          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            If you have any questions, please contact our support team at support@floraquiz.com
          </p>
        </div>

        <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 20px;">
          © 2026 FloraQuiz. All rights reserved.
        </p>
      </div>
    `;

    return this.sendEmail(email, `Welcome to FloraQuiz ${tierName}!`, htmlContent);
  }
}

module.exports = new EmailService();
