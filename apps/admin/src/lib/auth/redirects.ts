type Role = "admin" | "user" | "employee" | "vendor" | "preview";

export function getLandingPathForRole(role: Role | string | undefined): string {
  if (role === "vendor") return "/vendor";
  return "/dashboard";
}
