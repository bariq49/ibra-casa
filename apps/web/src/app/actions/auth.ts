"use server";

import { cookies } from "next/headers";

/**
 * Server Action to completely destroy the authentication token cookie
 * securely from the server-side to prevent client-side cache race conditions.
 */
export async function logoutServerSide() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
