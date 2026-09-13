"use client";

/**
 * CartContext — guest cart state management with localStorage persistence.
 *
 * Compatible with the existing Next.js App Router + React 19 architecture.
 * Uses the same ToastContext pattern as the rest of the app.
 */

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { Tile } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartItem {
  tile: Tile;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoaded: boolean;
}

type CartAction =
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { tileId: string; quantity: number } }
  | { type: "CLEAR" };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_ITEMS":
      return { items: action.payload, isLoaded: true };

    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.tile.id === action.payload.tile.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.tile.id === action.payload.tile.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.tile.id !== action.payload),
      };

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity < 1) {
        return {
          ...state,
          items: state.items.filter((i) => i.tile.id !== action.payload.tileId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.tile.id === action.payload.tileId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    }

    case "CLEAR":
      return { items: [], isLoaded: true };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CartContextValue {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (tile: Tile, quantity?: number) => void;
  removeFromCart: (tileId: string) => void;
  updateQuantity: (tileId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (tileId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "tesserae-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isLoaded: false });

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(CART_STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "SET_ITEMS", payload: parsed });
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // Persist to localStorage whenever items change (and are loaded)
  useEffect(() => {
    if (state.isLoaded) {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [state.items, state.isLoaded]);

  const addToCart = useCallback((tile: Tile, quantity: number = 1) => {
    if (!tile.inStock) return;
    dispatch({ type: "ADD_ITEM", payload: { tile, quantity } });
  }, []);

  const removeFromCart = useCallback((tileId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: tileId });
  }, []);

  const updateQuantity = useCallback((tileId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { tileId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const isInCart = useCallback(
    (tileId: string) => state.items.some((i) => i.tile.id === tileId),
    [state.items]
  );

  const total = state.items.reduce((sum, i) => sum + i.tile.price * i.quantity, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        total,
        itemCount,
        isLoading: !state.isLoaded,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}