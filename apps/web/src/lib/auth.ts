import { cookies } from "next/headers";

/**
 * A perfect, centralized utility to securely retrieve the current user session
 * universally inside any Server Component or API Route.
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Defensively parse against literal strings "null" or "undefined" that js-cookie sometimes saves
    const isValidToken =
      !!token &&
      token !== "null" &&
      token !== "undefined" &&
      token.trim() !== "";

    return {
      isLoggedIn: isValidToken,
      token: isValidToken ? token : null,
    };
  } catch (error) {
    // Failsafe returned if called improperly outside request context
    return {
      isLoggedIn: false,
      token: null,
    };
  }
}
