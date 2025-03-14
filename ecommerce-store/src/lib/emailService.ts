// lib/emailService.ts
import nodemailer from 'nodemailer';

// Configure your email provider
// For development, you can use something like Mailtrap, Sendgrid, or even a Gmail account
// For production, use a proper email service
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@example.com',
        pass: process.env.EMAIL_PASSWORD || 'your-password',
    },
});

export async function sendVerificationEmail(
    email: string,
    token: string,
    name: string
) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}&type=account`;

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'My App'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Verify your email address',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
      </div>
    `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendEmailChangeVerification(
    email: string,
    token: string,
    name: string
) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email-change?token=${token}`;

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'My App'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Verify your new email address',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>We received a request to change your email address. Please verify your new email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify New Email
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request this change, please contact us immediately.</p>
      </div>
    `,
    };

    return transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(
    email: string,
    token: string,
    name: string
) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'My App'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Reset your password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not request a password reset, please ignore this email or contact us if you have concerns.</p>
      </div>
    `,
    };

    return transporter.sendMail(mailOptions);
}