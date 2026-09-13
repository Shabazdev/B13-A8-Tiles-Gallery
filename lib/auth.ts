/**
 * Better Auth — Server Instance
 * Replaces Firebase Authentication entirely.
 *
 * Database strategy:
 *  - Local development → SQLite (DATABASE_URL=file:./db/tesserae.db)
 *  - Production/Vercel → PostgreSQL (DATABASE_URL=postgresql://...)
 * Both modes are driven purely by environment variables — no hard-coded secrets.
 */

import { mkdirSync } from "fs";
import path from "path";
import Database from "better-sqlite3";
import { betterAuth } from "better-auth";

const databaseUrl = process.env.DATABASE_URL;

function resolveDatabase():
  | Database.Database
  | { provider: "sqlite"; url: string }
  | { provider: "postgres"; url: string } {
  // Production: PostgreSQL (serverless-friendly, e.g. Neon / Supabase)
  if (databaseUrl && /^postgres(ql)?:\/\//.test(databaseUrl)) {
    return { provider: "postgres", url: databaseUrl };
  }

  // Local development: SQLite file database
  const rawPath = databaseUrl ? databaseUrl.replace(/^file:/, "") : path.join("db", "tesserae.db");
  const absolutePath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  return new Database(absolutePath);
}

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const auth = betterAuth({
  database: resolveDatabase(),
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
});

export type Session = typeof auth.$Infer.Session;
