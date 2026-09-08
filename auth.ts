import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "@/app/lib/prisma";

const googleId = process.env.GOOGLE_ID;
const googleSecret = process.env.GOOGLE_SECRET;

if (!googleId || !googleSecret) {
  throw new Error("Missing GOOGLE_ID or GOOGLE_SECRET environnement");
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email et mot de passe",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "exemple@email.com",
        },
        password: {
          label: "Mot de passe",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          throw new Error("Email ou mot de passe incorrect");
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    GoogleProvider({
      clientId: googleId,
      clientSecret: googleSecret,
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string | undefined;
        if (session.user && typeof token.sub === "string") {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
  secret: process.env.SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
