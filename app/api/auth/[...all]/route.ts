/**
 * Better Auth — Next.js App Router API Route Handler
 * All auth requests (sign-in, sign-up, OAuth callbacks, sign-out, session)
 * are served from /api/auth/[...all].
 */

import { auth } from "@/lib/auth";

const handler = auth.handler;

export { handler as GET, handler as POST };
