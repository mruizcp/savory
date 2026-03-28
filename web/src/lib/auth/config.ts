import type { NextAuthConfig } from "next-auth";

import { getAuthSecret } from "@/lib/auth/env";
import { buildProviders } from "@/lib/auth/providers";
import { prisma } from "@/server/db/prisma";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

export const authConfig = {
  trustHost: true,
  secret: getAuthSecret(),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: buildProviders(),
  callbacks: {
    async signIn({ user }) {
      if (!isDatabaseConfigured()) {
        return true;
      }
      const id =
        user && typeof user === "object" && typeof user.id === "string"
          ? user.id
          : null;
      if (id) {
        await prisma.user
          .updateMany({
            where: { id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {});
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && typeof user === "object") {
        if (typeof user.id === "string") {
          token.sub = user.id;
        }
        if (typeof user.email === "string") {
          token.email = user.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub ?? "") as string;
        if (token.email && typeof token.email === "string") {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
