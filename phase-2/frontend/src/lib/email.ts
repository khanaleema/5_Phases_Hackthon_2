/**
 * Email service for Better Auth
 * Supports development (console logging) and production (SMTP/Resend)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured service
 * In development: logs to console
 * In production: uses SMTP or Resend
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
  const emailService = process.env.EMAIL_SERVICE || 'console';
  
  // If Resend API key is provided, use it (works in both dev and production)
  if (emailService === 'resend' && process.env.RESEND_API_KEY) {
    // Use Resend
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      });

      if (result.error) {
        console.error('Resend API error:', result.error);
        throw new Error(result.error.message || 'Failed to send email via Resend');
      }

      console.log('✅ Email sent successfully via Resend:', result.data?.id);
      return;
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      throw error;
    }
  }
  
  // Fallback to console logging if no email service configured
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment || emailService === 'console' || (!process.env.RESEND_API_KEY && !process.env.SMTP_HOST)) {
    console.log('\n📧 ===== EMAIL SENT (Console Log) =====');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    if (text) console.log('Text:', text);
    console.log('=====================================\n');
    return;
  }
  
  // Production: Use SMTP if configured
  if (emailService === 'smtp' && process.env.SMTP_HOST) {
    // Use SMTP (nodemailer)
    try {
      const nodemailer = await import('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      });
    } catch (error) {
      console.error('Failed to send email via SMTP:', error);
      throw error;
    }
  } else {
    // Fallback: Log in production if no service configured
    console.warn('⚠️ No email service configured. Email not sent.');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
  }
}

