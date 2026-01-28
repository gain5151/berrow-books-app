import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { prisma } from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          console.log(`★★★/lib/auth.ts★★★`, email, url)
          if (email === "" || email !== process.env.NEXTAUTH_EMAIL_OWNER) {
            console.log(`★★★/lib/auth.ts★★★`, email, url)
            throw new Error("Invalid email. We only support gain5151@yahoo.co.jp");
          }
          await resend.emails.send({
            from: process.env.EMAIL_FROM || "noreply@example.com",
            to: email,
            subject: "Berrow Books - ログインリンク",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Berrow Books</h1>
                <p>以下のリンクをクリックしてログインしてください。</p>
                <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
                  ログインする
                </a>
                <p style="color: #666; margin-top: 20px;">このリンクは24時間有効です。</p>
              </div>
            `,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
