/**
 * Orders API — creates a real order record in MongoDB.
 *
 * POST /api/orders
 *   Body: { items: [{ productId, quantity }], shipping: {...}, idempotencyKey }
 *
 * Behaviour:
 *  - Requires an authenticated Better Auth session (401 otherwise).
 *  - Re-validates every productId/quantity server-side and RE-PRICES from the
 *    server catalogue (lib/tiles.ts) — client-supplied prices are never trusted.
 *  - Free shipping over $150, otherwise a flat $9.95 shipping fee.
 *  - Idempotent: the same idempotencyKey never creates two orders (duplicate
 *    clicks / refreshes return the original order instead).
 *  - This project has no payment provider configured, so orders are created
 *    with paymentStatus "unpaid" and orderStatus "confirmed"
 *    (cash on delivery).
 *
 * GET /api/orders?orderId=... — fetch a single order owned by the caller.
 *   Used by the order-success page. Refreshing that page re-fetches the same
 *   order; it never creates a duplicate.
 */

import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getAppDb } from "@/lib/db";
import { TILES_DATA } from "@/lib/tiles";
import type { Order, OrderItem, PaymentStatus, ShippingInfo } from "@/lib/types";

const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING_FEE = 9.95;

function isDatabaseError(error: unknown): boolean {
  const name = (error as { name?: string } | null)?.name ?? "";
  if (/^Mongo/i.test(name)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return /server selection|querySrv|getaddrinfo|ECONNREFUSED|ENOTFOUND|alert number 80|tlsv1 alert/i.test(
    message
  );
}

function badRequest(message: string) {
  return Response.json({ code: "INVALID_ORDER", message }, { status: 400 });
}

function validateShipping(shipping: unknown): shipping is ShippingInfo {
  if (!shipping || typeof shipping !== "object") return false;
  const s = shipping as Record<string, unknown>;
  const required = ["fullName", "phone", "address", "city", "postalCode", "country"];
  return required.every(
    (key) => typeof s[key] === "string" && (s[key] as string).trim().length > 0
  );
}

export async function GET(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json(
      { code: "UNAUTHENTICATED", message: "Please sign in to view this order." },
      { status: 401 }
    );
  }

  const orderId = new URL(request.url).searchParams.get("orderId")?.trim();
  if (!orderId) {
    return badRequest("An orderId query parameter is required.");
  }

  try {
    const db = await getAppDb();
    const order = await db
      .collection<Order>("orders")
      .findOne({ orderId, userId: session.user.id });
    if (!order) {
      return Response.json(
        { code: "ORDER_NOT_FOUND", message: "No such order was found for your account." },
        { status: 404 }
      );
    }
    const { _id, ...rest } = order;
    void _id;
    return Response.json({ order: rest }, { status: 200 });
  } catch (error) {
    console.error("[orders] Failed to fetch order:", error);
    if (isDatabaseError(error)) {
      return Response.json(
        {
          code: "DATABASE_UNAVAILABLE",
          message:
            "The order database is unreachable from the server. Check MONGODB_URI and MONGODB_DB_NAME, and make sure this server's IP address is allowed in MongoDB Atlas (Network Access).",
        },
        { status: 503 }
      );
    }
    return Response.json(
      { code: "ORDER_FAILED", message: "We could not load your order. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json(
      { code: "UNAUTHENTICATED", message: "Please sign in to place an order." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("The request body must be valid JSON.");
  }

  const { items, shipping, idempotencyKey } = (body ?? {}) as {
    items?: unknown;
    shipping?: unknown;
    idempotencyKey?: unknown;
  };

  if (!Array.isArray(items) || items.length === 0) {
    return badRequest("Your cart is empty. Add at least one tile before checking out.");
  }
  if (items.length > 50) {
    return badRequest("An order can contain at most 50 line items.");
  }
  if (!validateShipping(shipping)) {
    return badRequest(
      "Shipping information is incomplete. Full name, phone, address, city, postal code and country are all required."
    );
  }
  if (typeof idempotencyKey !== "string" || idempotencyKey.trim().length < 8) {
    return badRequest("A valid idempotency key is required to prevent duplicate orders.");
  }

  // Re-price server-side from the canonical catalogue.
  const orderItems: OrderItem[] = [];
  for (const entry of items) {
    const row = entry as { productId?: unknown; quantity?: unknown };
    if (typeof row?.productId !== "string") {
      return badRequest("Each cart item must include a productId.");
    }
    const tile = TILES_DATA.find((t) => t.id === row.productId);
    if (!tile) {
      return badRequest(`Unknown product "${row.productId}". Please refresh your cart.`);
    }
    if (!tile.inStock) {
      return badRequest(`"${tile.title}" is currently out of stock and cannot be ordered.`);
    }
    const qty = Number(row.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return badRequest(`Invalid quantity for "${tile.title}". Quantity must be 1-99.`);
    }
    orderItems.push({
      productId: tile.id,
      title: tile.title,
      image: tile.image,
      unitPrice: tile.price,
      quantity: qty,
      itemSubtotal: Math.round(tile.price * qty * 100) / 100,
    });
  }

  const subtotal =
    Math.round(orderItems.reduce((sum, i) => sum + i.itemSubtotal, 0) * 100) / 100;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = Math.round((subtotal + shippingCost) * 100) / 100;

  const cleanShipping: ShippingInfo = {
    fullName: shipping.fullName.trim(),
    phone: shipping.phone.trim(),
    address: shipping.address.trim(),
    city: shipping.city.trim(),
    postalCode: shipping.postalCode.trim(),
    country: shipping.country.trim(),
  };

  try {
    const db = await getAppDb();
    const orders = db.collection<Order>("orders");

    const existing = await orders.findOne({
      orderId: idempotencyKey.trim(),
      userId: session.user.id,
    });
    if (existing) {
      const { _id, ...rest } = existing;
      void _id;
      return Response.json({ order: rest }, { status: 200 });
    }

    const order: Order = {
      orderId: idempotencyKey.trim(),
      userId: session.user.id,
      userEmail: session.user.email,
      items: orderItems,
      subtotal,
      shippingCost,
      total,
      shipping: cleanShipping,
      paymentStatus: "unpaid" satisfies PaymentStatus,
      orderStatus: "confirmed",
      createdAt: new Date().toISOString(),
    };

    await orders.insertOne(order);
    return Response.json({ order }, { status: 201 });
  } catch (error) {
    console.error("[orders] Failed to create order:", error);
    if (isDatabaseError(error)) {
      return Response.json(
        {
          code: "DATABASE_UNAVAILABLE",
          message:
            "The order database is unreachable from the server. Check MONGODB_URI and MONGODB_DB_NAME, and make sure this server's IP address is allowed in MongoDB Atlas (Network Access).",
        },
        { status: 503 }
      );
    }
    if ((error as { code?: number })?.code === 11000) {
      try {
        const db = await getAppDb();
        const original = await db
          .collection<Order>("orders")
          .findOne({ orderId: idempotencyKey.trim(), userId: session.user.id });
        if (original) {
          const { _id, ...rest } = original;
          void _id;
          return Response.json({ order: rest }, { status: 200 });
        }
      } catch {
        // fall through to generic error
      }
    }
    return Response.json(
      { code: "ORDER_FAILED", message: "We could not place your order. Please try again." },
      { status: 500 }
    );
  }
}
