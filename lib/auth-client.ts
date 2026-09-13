/**
 * Better Auth — Client Instance (React)
 * Used by all client components for session state and auth actions.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export type ClientSession = typeof authClient.$Infer.Session;
export type ClientUser = ClientSession["user"];
