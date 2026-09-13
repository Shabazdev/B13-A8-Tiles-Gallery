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
