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

/**
 * Return a JSON error that the Better Auth client can actually parse.
 *
 * Without this, an initialisation failure (a missing MONGODB_URI, an
 * unreachable database, a bad URL…) escapes as a bodyless 500 with no
 * JSON content type. The Better Auth client then has no `code`/`message`
 * to read, so the UI can only render the generic
 * "An unexpected error occurred. Please try again." — which hides the
 * real cause and makes setup problems impossible to debug.
 *
 * Responding with `{ code, message, status }` matches the BetterFetchError
 * shape, so `parseAuthError()` in lib/auth-context.tsx can map it to a
 * precise, human-readable message.
 */
function authErrorResponse(code: string, message: string, status = 500): Response {
  return Response.json({ code, message, status }, { status });
}

/**
 * Is this a database connectivity failure?
 *
 * These are the one class of error the operator can act on, and they used to
 * look identical to "something went wrong" in the UI. Covers the driver's
 * named errors (MongoServerSelectionError, MongoNetworkError…) and the
 * transport-level text they carry: SRV lookup failure, refused connection, or
 * a TLS alert from the cluster endpoint.
 */
function isDatabaseError(error: unknown): boolean {
  const name = (error as { name?: string } | null)?.name ?? "";
  if (/^Mongo/i.test(name)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return /server selection|querySrv|getaddrinfo|ECONNREFUSED|ENOTFOUND|alert number 80|tlsv1 alert/i.test(
    message
  );
}

const DATABASE_HINT =
  "The authentication database is unreachable from the server. Check MONGODB_URI and MONGODB_DB_NAME, and make sure this server's IP address is allowed in MongoDB Atlas (Network Access).";

/**
 * Single entry point for GET/POST. Initialisation *and* handler failures are
 * both converted to a parseable JSON error instead of an opaque 500.
 *
 * Note: `handlerPromise` is only assigned after `getAuth()` resolves, so a
 * failed initialisation is never cached — once the environment is fixed the
 * next request succeeds without a server restart.
 */
async function handle(request: Request): Promise<Response> {
  let handler: (request: Request) => Promise<Response>;

  try {
    handler = await getHandler();
  } catch (error) {
    // The auth instance could not be built. In practice this is always a
    // configuration problem, so the message is safe (and useful) to expose.
    console.error("[auth] Failed to initialise:", error);
    if (isDatabaseError(error)) {
      return authErrorResponse("DATABASE_UNAVAILABLE", DATABASE_HINT, 503);
    }
    return authErrorResponse(
      "SERVER_CONFIG_ERROR",
      error instanceof Error && error.message
        ? error.message
        : "The authentication service is not configured on the server."
    );
  }

  try {
    return await handler(request);
  } catch (error) {
    // Better Auth returns error Responses for expected failures, so a throw
    // here means something genuinely unexpected. Log the detail but answer with
    // something the operator can act on rather than leaking internals.
    console.error("[auth] Handler threw:", error);
    if (isDatabaseError(error)) {
      return authErrorResponse("DATABASE_UNAVAILABLE", DATABASE_HINT, 503);
    }
    return authErrorResponse(
      "SERVER_ERROR",
      "Something went wrong while processing that request. Please try again."
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
