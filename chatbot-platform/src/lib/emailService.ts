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
        from: `"${process.env.EMAIL_FROM_NAME || 'LulAI Chatbot platform'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Verify your email address',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Thank you for signing up to lulAI chatbot platform! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color:rgb(0, 0, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
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
        from: `"${process.env.EMAIL_FROM_NAME || 'LulAI Chatbot platform'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Verify your new email address',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>We received a request to change your email address. Please verify your new email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color:rgb(0, 0, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
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
        from: `"${process.env.EMAIL_FROM_NAME || 'LulAI Chatbot platform'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Reset your password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color:rgb(0, 0, 0); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
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

/**
 * Send admin setup email with instructions and access details
 */
export async function sendAdminSetupEmail(
    email: string,
    name: string,
    setupToken: string,
    accessPath: string,
    accessKey: string
) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Use the new path that doesn't go through the admin layout
    const setupUrl = `${appUrl}/admin-setup?token=${setupToken}`;

    const loginUrl = `${appUrl}${accessPath}?key=${accessKey}`;

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Admin System'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Set up your admin account',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Welcome to the admin system! Please follow these steps to set up your account:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #4a89dc;">
          <h3 style="margin-top: 0;">Step 1: Set Your Password</h3>
          <p>First, set up your admin password by clicking the button below:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${setupUrl}" style="background-color: #4a89dc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Set Password
            </a>
          </div>
          
          <p style="font-size: 12px;">Or copy and paste this URL: ${setupUrl}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #3d5a80;">
          <h3 style="margin-top: 0;">Step 2: Access Admin Dashboard</h3>
          <p>After setting your password, access the admin dashboard at:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${loginUrl}" style="background-color: #3d5a80; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Admin Login
            </a>
          </div>
          
          <p style="font-size: 12px;">Or copy and paste this URL: ${loginUrl}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0; color: #856404;">Important Notes</h3>
          <ul>
            <li>This secure URL and key will be refreshed periodically for security reasons.</li>
            <li>Bookmark the admin login page or save it somewhere secure.</li>
            <li>This setup link will expire in 24 hours.</li>
            <li>If you didn't request this, please ignore this email.</li>
          </ul>
        </div>
      </div>
    `,
    };

    return transporter.sendMail(mailOptions);
}

/**
 * Send admin access update email with new secure URL and key
 */
export async function sendAdminAccessUpdateEmail(
    email: string,
    name: string,
    accessPath: string,
    accessKey: string,
    expiresAt: Date
) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}${accessPath}?key=${accessKey}`;
    const expirationDate = expiresAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Admin System'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Updated Admin Access URL and Key',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello ${name},</h2>
        <p>Your admin access URL and key have been updated for security reasons.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #3d5a80;">
          <h3 style="margin-top: 0;">New Admin Access Details</h3>
          <p>Access the admin dashboard using the link below:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${loginUrl}" style="background-color: #3d5a80; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Admin Login
            </a>
          </div>
          
          <p style="font-size: 12px;">Or copy and paste this URL: ${loginUrl}</p>
          
          <p><strong>This link will expire on:</strong> ${expirationDate}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0; color: #856404;">Important Notes</h3>
          <ul>
            <li>The previous access URL is no longer valid.</li>
            <li>Bookmark this new admin login page or save it somewhere secure.</li>
            <li>You will receive a new URL before this one expires.</li>
            <li>If you need to update these details manually, you can do so from the admin settings.</li>
          </ul>
        </div>
      </div>
    `,
    };

    return transporter.sendMail(mailOptions);
}