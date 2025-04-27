// src/lib/email.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
    // Get the email settings from environment variables
    const emailUser = process.env.EMAIL_USER || 'no-reply@lulai.com';
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST || 'smtp.example.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587', 10);
    const defaultFromEmail = process.env.EMAIL_FROM || 'Lulai <no-reply@lulai.com>';

    // Check if we have the required email credentials
    if (!emailPassword) {
        console.warn('Email password not configured. Email not sent.');

        // In development, log the email content for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log('Email would have been sent:');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${html}`);
        }

        // Don't throw an error, just return so the app doesn't crash
        return;
    }

    // Create a transport
    const transport = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true if 465, false for other ports
        auth: {
            user: emailUser,
            pass: emailPassword,
        },
    });

    try {
        // Send the email
        const info = await transport.sendMail({
            from: from || defaultFromEmail,
            to,
            subject,
            html,
        });

        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);

        // If we're in development, log a fallback message
        if (process.env.NODE_ENV === 'development') {
            console.log('Email content (not sent due to error):');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
        }

        throw error;
    }
}