import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compareSync } from 'bcrypt-edge';
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.select().from(users).where(eq(users.email, credentials.email as string)).limit(1);

          if (!user || user.length === 0) {
            throw new Error('UserNotFound');
          }

          const foundUser = user[0];

          if (!foundUser?.password) {
            throw new Error('PasswordNotSet');
          }

          const validPassword = compareSync(credentials.password as string, foundUser.password);

          if (!validPassword) {
            throw new Error('InvalidCredentials');
          }

          const { ...userWithoutPassword } = foundUser;
          return userWithoutPassword;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account?.provider === "credentials") {
        token.provider = "credentials";
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        id: token.id as string,
        name: token.name,
        email: token.email,
        image: token.picture
      }
    }),
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  pages: {
    signIn: "/sign_in",
    error: "/sign_in",
    signOut: "/sign_in"
  },
  secret: process.env.AUTH_SECRET!,
} satisfies NextAuthConfig;