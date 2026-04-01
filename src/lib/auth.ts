import { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to: email,
            subject: 'BCRT - Link de Acesso',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #075e54;">BCRT - Behavioral Cyberbullying Response Task</h2>
                <p>Você solicitou acesso ao painel administrativo.</p>
                <p>Clique no botão abaixo para acessar:</p>
                <a href="${url}" style="display: inline-block; background-color: #075e54; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                  Acessar Painel
                </a>
                <p style="color: #666; font-size: 14px;">Este link expira em 24 horas.</p>
                <p style="color: #666; font-size: 14px;">Se você não solicitou este acesso, ignore este email.</p>
              </div>
            `,
          });
        } catch (error) {
          console.error('Error sending verification email:', error);
          throw new Error('Failed to send verification email');
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow admin emails to sign in
      if (!user.email) return false;
      return adminEmails.includes(user.email.toLowerCase());
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    verifyRequest: '/admin/verify-request',
    error: '/admin/error',
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export function isAdminEmail(email: string): boolean {
  return adminEmails.includes(email.toLowerCase());
}
