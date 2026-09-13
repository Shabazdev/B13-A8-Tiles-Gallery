/**
 * Better Auth — Next.js App Router API Route Handler
 * All auth requests (sign-in, sign-up, OAuth callbacks, sign-out, session)
 * are served from /api/auth/[...all].
 */

import { getAuth } from "@/lib/auth";

// Lazy-initialize the auth handler on first request
let handlerPromise: Promise<(request: Request) => Promise<Response>> | null = null;

async function getHandler() {
  if (!handlerPromise) {
    const auth = await getAuth();
    handlerPromise = Promise.resolve(auth.handler);
  }
  return handlerPromise;
}

export async function GET(request: Request) {
  const handler = await getHandler();
  return handler(request);
}

export async function POST(request: Request) {
  const handler = await getHandler();
  return handler(request);
}
