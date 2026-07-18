// Preview-mode infrastructure has been removed for production. This hook is
// kept as a no-op so existing call sites continue to compile without changes.
// `isPreview` is always false and `blockIfPreview` never blocks.
export function usePreviewGuard() {
  return {
    isPreview: false as const,
    blockIfPreview: (_action?: string) => false,
  };
}
