/**
 * Better Auth — Next.js App Router API Route Handler
 * All auth requests (sign-in, sign-up, OAuth callbacks, sign-out, session)
 * are served from /api/auth/[...all].
 */

import { getAuth } from "@/lib/auth";
import tls from "node:tls";

// Configure default ECDH curve to prime256v1 to bypass ESET SSL/TLS protocol filtering
// issues with post-quantum ciphers/curves (such as Kyber X25519Kyber768Draft00)
tls.DEFAULT_ECDH_CURVE = "prime256v1";

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
function authErrorResponse(code: string, message: string): Response {
  return Response.json({ code, message, status: 500 }, { status: 500 });
}

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

  const url = new URL(request.url);
  if (url.pathname.includes("/api/auth/callback/google")) {
    console.log("[auth-debug] Google OAuth Callback request received:", {
      url: request.url,
      method: request.method,
      searchParams: Object.fromEntries(url.searchParams.entries()),
      headers: {
        host: request.headers.get("host"),
        referer: request.headers.get("referer"),
        "user-agent": request.headers.get("user-agent"),
      },
    });
  }

  try {
    handler = await getHandler();
  } catch (error) {
    // The auth instance could not be built. In practice this is always a
    // configuration problem, so the message is safe (and useful) to expose.
    console.error("[auth] Failed to initialise:", error);
    return authErrorResponse(
      "SERVER_CONFIG_ERROR",
      error instanceof Error && error.message
        ? error.message
        : "The authentication service is not configured on the server."
    );
  }

  try {
    const response = await handler(request);
    if (url.pathname.includes("/api/auth/callback/google")) {
      console.log("[auth-debug] Google OAuth Callback handler returned status:", response.status, {
        headers: Object.fromEntries(response.headers.entries()),
      });
    }
    return response;
  } catch (error) {
    // Better Auth returns error Responses for expected failures, so a throw
    // here means something genuinely unexpected. Log the detail but return a
    // generic message rather than leaking internals to the browser.
    console.error("[auth] Handler threw:", error);
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
