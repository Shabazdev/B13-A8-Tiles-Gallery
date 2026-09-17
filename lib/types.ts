/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tile {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
  currency: string;
  dimensions: string;
  material: string;
  inStock: boolean;
  creator: string;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  isGoogleUser?: boolean;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  unitPrice: number;
  quantity: number;
  itemSubtotal: number;
}

export type OrderStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "failed";

export interface Order {
  _id?: string;
  orderId: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shipping: ShippingInfo;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
}
