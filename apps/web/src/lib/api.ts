import API_ENDPOINTS from "@/constants/endpoints";

/**
 * Custom error class for API responses
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any, message?: string) {
    super(message || `API Error: ${status}`);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  next?: NextFetchRequestConfig;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Standardized API client using native fetch for Next.js Cache Support.
 */
const request = async <T = any>(
  method: string,
  url: string,
  options: RequestOptions = {}
): Promise<{ data: T; status: number; config: any }> => {
  const { params, headers: customHeaders, ...rest } = options;

  // 1. Build URL with params
  let fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryString;
    }
  }

  // 2. Prepare Headers
  const headers = new Headers(customHeaders);
  if (!headers.has("Content-Type") && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // 3. Handle Authentication (Environment Sensitive)
  let token: string | undefined;
  if (typeof window === "undefined") {
    // SERVER SIDE
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    } catch (e) {
      // In some server contexts (like some edge cases), cookies() might not be available
    }
  } else {
    // CLIENT SIDE
    const Cookies = (await import("js-cookie")).default;
    token = Cookies.get("token");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const startTime = Date.now();

  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      ...rest,
    });

    const duration = Date.now() - startTime;
    let data : any;
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Client-side logging logic
    if (typeof window !== "undefined") {
      import("./api-logger").then(({ ApiLogger }) => {
        ApiLogger.addLog({
          method: method.toUpperCase(),
          originalUrl: url,
          statusCode: response.status,
          responseTimeMs: duration,
          source: "user",
          errorObj: response.ok ? undefined : data,
        });
      });
    }

    if (!response.ok) {
      throw new ApiError(response.status, data);
    }

    return {
      data: data as T,
      status: response.status,
      config: { method, url: fullUrl, ...options },
    };
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    
    // Handle network errors
    const duration = Date.now() - startTime;
    if (typeof window !== "undefined") {
      import("./api-logger").then(({ ApiLogger }) => {
        ApiLogger.addLog({
          method: method.toUpperCase(),
          originalUrl: url,
          statusCode: 0,
          responseTimeMs: duration,
          source: "user",
          errorObj: error.message,
        });
      });
    }
    throw error;
  }
};

const api = {
  get: <T = any>(url: string, options?: RequestOptions) => {
    // Under Next.js 15, fetch defaults to 'no-store' unless explicitly set to 'force-cache'.
    // Since 10 minute caching is globally desired by default, we apply it.
    let cacheSetting = options?.cache;
    if (!cacheSetting) {
      cacheSetting = typeof window === 'undefined' ? "force-cache" : "no-store";
    }

    return request<T>("GET", url, {
      ...options,
      cache: cacheSetting,
      next: {
        revalidate: options?.next?.revalidate ?? 600, // Default to 10 minutes
        ...options?.next,
      },
    });
  },
  post: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    request<T>("POST", url, {
      ...options,
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  put: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    request<T>("PUT", url, {
      ...options,
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  patch: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    request<T>("PATCH", url, {
      ...options,
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: <T = any>(url: string, data?: any, options?: RequestOptions) =>
    request<T>("DELETE", url, {
      ...options,
      body: data
        ? data instanceof FormData
          ? data
          : JSON.stringify(data)
        : undefined,
    }),
};

export { API_ENDPOINTS };
export default api;
