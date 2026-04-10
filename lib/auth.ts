import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          isPro: user.isPro,
          displayName: user.displayName,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = (user as any).id;
        token.isPro = (user as any).isPro;
        token.displayName = (user as any).displayName;
      }

      if (token?.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isPro: true, displayName: true },
        });

        if (freshUser) {
          token.isPro = freshUser.isPro;
          token.displayName = freshUser.displayName;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isPro = Boolean(token.isPro);
        session.user.displayName = token.displayName || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
