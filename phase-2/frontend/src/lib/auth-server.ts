import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { sendEmail } from './email';

// Email normalization helper - fixes login issues with case-sensitive emails
const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want to require verification
    // Enable verification email sending (even if not required)
    // Better Auth will enable the endpoint if this function is defined
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify your email address',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Verify Your Email</h2>
              <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #6b7280; word-break: break-all;">${url}</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
            </div>
          `,
          text: `Verify your email address by visiting: ${url}`,
        });
      } catch (error) {
        console.error('Failed to send verification email:', error);
        // Don't throw - Better Auth will handle the error
      }
    },
    // Enable password reset email sending
    // Better Auth will enable the endpoint if this function is defined
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Reset your password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Reset Your Password</h2>
              <p>You requested to reset your password. Click the button below to create a new password:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #6b7280; word-break: break-all;">${url}</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
          `,
          text: `Reset your password by visiting: ${url}`,
        });
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        // Don't throw - Better Auth will handle the error
      }
    },
  },
  plugins: [
    jwt({
      secret: process.env.BETTER_AUTH_SECRET || '',
    }),
  ],
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET || '',
  hooks: {
    user: {
      created: async ({ user }) => {
        const normalizedEmail = normalizeEmail(user.email);
        if (user.email !== normalizedEmail) {
          await prisma.user.update({ where: { id: user.id }, data: { email: normalizedEmail } });
          const account = await prisma.account.findFirst({
            where: { userId: user.id, providerId: 'credential' },
          });
          if (account && account.accountId !== normalizedEmail) {
            await prisma.account.update({ where: { id: account.id }, data: { accountId: normalizedEmail } });
          }
        }
      },
      updated: async ({ user }) => {
        if (user.email) {
          const normalizedEmail = normalizeEmail(user.email);
          if (user.email !== normalizedEmail) {
            await prisma.user.update({ where: { id: user.id }, data: { email: normalizedEmail } });
          }
        }
      },
    },
    account: {
      created: async ({ account }) => {
        if (account.providerId === 'credential' && account.accountId) {
          const normalized = normalizeEmail(account.accountId);
          if (account.accountId !== normalized) {
            await prisma.account.update({ where: { id: account.id }, data: { accountId: normalized } });
          }
        }
      },
    },
  },
});

// One-time function to fix existing emails (run once: await normalizeAllEmails())
export async function normalizeAllEmails() {
  const users = await prisma.user.findMany();
  let fixed = 0;
  for (const user of users) {
    const normalized = normalizeEmail(user.email);
    if (user.email !== normalized) {
      await prisma.user.update({ where: { id: user.id }, data: { email: normalized } });
      const account = await prisma.account.findFirst({
        where: { userId: user.id, providerId: 'credential' },
      });
      if (account && account.accountId !== normalized) {
        await prisma.account.update({ where: { id: account.id }, data: { accountId: normalized } });
      }
      fixed++;
    }
  }
  return { fixed, total: users.length };
}

