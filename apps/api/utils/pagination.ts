/**
 * Centralized pagination config for the API.
 * Change DEFAULT_PER_PAGE here to update all controller defaults at once.
 *
 * Usage in controllers:
 *   import { resolvePerPage } from "../utils/pagination.js";
 *
 *   const { limit, noLimit } = resolvePerPage(req.query.perPage, req.query.noLimit);
 *   // if noLimit === true, skip the .limit() call entirely
 */
export const DEFAULT_PER_PAGE = 25;

/**
 * Resolves the `perPage` query param into a numeric limit.
 * If the caller passes `noLimit=true` (as string "true"), returns null
 * which signals the controller to skip .limit() and return all documents.
 */
export function resolvePerPage(
  perPageRaw: unknown,
  noLimitRaw: unknown,
): { limit: number; isNoLimit: boolean } {
  const isNoLimit = noLimitRaw === "true" || noLimitRaw === true;
  if (isNoLimit) {
    return { limit: 0, isNoLimit: true };
  }
  const parsed = parseInt(perPageRaw as string);
  const limit = parsed > 0 ? parsed : DEFAULT_PER_PAGE;
  return { limit, isNoLimit: false };
}
