import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import { CREDENTIALS_PROVIDER_ID } from "@/lib/auth/credentials-constants";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { prisma } from "@/server/db/prisma";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

function buildCredentialsProvider(): NextAuthConfig["providers"][number] {
  return Credentials({
    id: CREDENTIALS_PROVIDER_ID,
    name: "Correo y contraseña",
    credentials: {
      email: { label: "Correo", type: "email" },
      password: { label: "Contraseña", type: "password" },
    },
    async authorize(credentials) {
      if (!isDatabaseConfigured()) {
        return null;
      }
      const email = credentials?.email;
      const password = credentials?.password;
      if (typeof email !== "string" || typeof password !== "string") {
        return null;
      }
      const normalized = normalizeEmail(email);
      if (!normalized || !password) {
        return null;
      }
      const row = await prisma.user.findUnique({
        where: { email: normalized },
        select: {
          id: true,
          email: true,
          displayName: true,
          passwordHash: true,
        },
      });
      if (!row?.passwordHash) {
        return null;
      }
      const ok = await compare(password, row.passwordHash);
      if (!ok) {
        return null;
      }
      return {
        id: row.id,
        email: row.email,
        name: row.displayName ?? undefined,
      };
    },
  });
}

export function buildProviders(): NextAuthConfig["providers"] {
  return [buildCredentialsProvider()];
}
