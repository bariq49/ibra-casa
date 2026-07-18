import { AxiosError } from "axios";

type ApiErrorBody = {
  message?: string;
  error?: string;
};

function isAxiosLike(error: unknown): error is AxiosError<ApiErrorBody> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as { isAxiosError?: boolean }).isAxiosError === true
  );
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (isAxiosLike(error)) {
    const body = error.response?.data;
    if (body?.message) return body.message;
    if (body?.error) return body.error;
    if (error.message) return error.message;
  }

  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (isAxiosLike(error)) return error.response?.status;
  return undefined;
}
