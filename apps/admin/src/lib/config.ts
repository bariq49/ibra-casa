import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * Configuration utility for Admin API
 */
interface AdminApiConfig {
  baseURL: string;
  isProduction: boolean;
}

/**
 * Get API configuration for admin
 */
export const getAdminApiConfig = (): AdminApiConfig => {
  const apiUrl = import.meta.env.VITE_NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "VITE_NEXT_PUBLIC_API_URL environment variable is not defined",
    );
  }

  const isProduction =
    import.meta.env.VITE_APP_ENV === "production" ||
    import.meta.env.PROD === true;

  return {
    baseURL: `${apiUrl}/api`,
    isProduction,
  };
};

/**
 * Create configured axios instance
 */
const createApiInstance = (): AxiosInstance => {
  const { baseURL } = getAdminApiConfig();

  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout
  });

  // Add request interceptor to include auth token
  instance.interceptors.request.use(
    (config) => {
      // Get token from localStorage (zustand persist stores it there)
      const authData = localStorage.getItem("auth-storage");
      if (authData) {
        try {
          const parsedData = JSON.parse(authData);
          const token = parsedData.state?.token;
          const userRole = parsedData.state?.user?.role;

          // (preview-mode CRUD block removed for production)
          void userRole;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error parsing auth data:", error);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Custom type to attach start time
  interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }

  // Interceptor for API Logging (Request - Start Time)
  instance.interceptors.request.use((config) => {
    (config as CustomAxiosRequestConfig).metadata = { startTime: Date.now() };
    return config;
  });

  // Interceptor for API Logging (Response - Capture Data)
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      try {
        const config = response.config as CustomAxiosRequestConfig;
        const duration = config.metadata?.startTime
          ? Date.now() - config.metadata.startTime
          : 0;

        import("./api-logger").then(({ ApiLogger }) => {
          ApiLogger.addLog({
            method: config.method?.toUpperCase() || "GET",
            originalUrl: config.url || "",
            statusCode: response.status,
            responseTimeMs: duration,
            source: "admin",
          });
        });
      } catch (e) {
        console.error("Error logging API success", e);
      }
      return response;
    },
    async (error) => {
      try {
        const config = error.config as CustomAxiosRequestConfig;
        const duration = config?.metadata?.startTime
          ? Date.now() - config.metadata.startTime
          : 0;

        import("./api-logger").then(({ ApiLogger }) => {
          ApiLogger.addLog({
            method: config?.method?.toUpperCase() || "GET",
            originalUrl: config?.url || "",
            statusCode: error.response?.status || 500,
            responseTimeMs: duration,
            source: "admin",
            errorObj: error.response?.data || error.message,
          });
        });
      } catch (e) {
        console.error("Error logging API error", e);
      }

      if (error.code === "ERR_NETWORK") {
        console.error(
          "Network Error: Unable to connect to the server. Please check if the server is running.",
        );
      }

      // Handle 401 unauthorized errors - but not for login/register endpoints
      if (error.response?.status === 401) {
        const requestUrl = error.config?.url || "";

        // Don't redirect if it's a login or register request failure
        if (
          !requestUrl.includes("/auth/login") &&
          !requestUrl.includes("/auth/register")
        ) {
          // Clear auth data and redirect to login
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Create and export the configured axios instance
export const adminApi = createApiInstance();

/**
 * Admin API endpoints
 */
export const ADMIN_API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",

  // Users
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,
  CREATE_USER: "/users",
  UPDATE_USER: (id: string) => `/users/${id}`,
  DELETE_USER: (id: string) => `/users/${id}`,

  // Products
  PRODUCTS: "/products",
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  CREATE_PRODUCT: "/products",
  UPDATE_PRODUCT: (id: string) => `/products/${id}`,
  DELETE_PRODUCT: (id: string) => `/products/${id}`,

  // Categories
  CATEGORIES: "/categories",
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
  CREATE_CATEGORY: "/categories",
  UPDATE_CATEGORY: (id: string) => `/categories/${id}`,
  DELETE_CATEGORY: (id: string) => `/categories/${id}`,

  // Brands
  BRANDS: "/brands",
  BRAND_BY_ID: (id: string) => `/brands/${id}`,
  CREATE_BRAND: "/brands",
  UPDATE_BRAND: (id: string) => `/brands/${id}`,
  DELETE_BRAND: (id: string) => `/brands/${id}`,

  // Orders
  ORDERS: "/orders",
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  UPDATE_ORDER_STATUS: (id: string) => `/orders/${id}/status`,

  // Stats & Analytics
  STATS: "/stats",
  ANALYTICS: "/analytics",
  DASHBOARD_STATS: "/stats/dashboard",

  // Banners
  BANNERS: "/banners",
  BANNER_BY_ID: (id: string) => `/banners/${id}`,
  CREATE_BANNER: "/banners",
  UPDATE_BANNER: (id: string) => `/banners/${id}`,
  DELETE_BANNER: (id: string) => `/banners/${id}`,

  // Vendor portal (vendor-scoped endpoints used by /vendor routes)
  VENDOR_ME: "/vendors/me",
  VENDOR_REGISTER: "/vendors",
  VENDOR_DASHBOARD_STATS: "/vendors/dashboard/stats",
  VENDOR_PRODUCTS: "/vendors/products",
  VENDOR_PRODUCT_BY_ID: (id: string) => `/vendors/products/${id}`,
  VENDOR_ORDERS: "/vendors/orders",
  VENDOR_ORDER_BY_ID: (id: string) => `/vendors/orders/${id}`,

  // Admin oversight of vendors
  VENDORS_REQUESTS: "/vendors/requests",
  VENDOR_BY_ID_STATUS: (id: string) => `/vendors/${id}/status`,
  VENDOR_BY_ID: (id: string) => `/vendors/${id}`,
  VENDOR_ADMIN_ANALYTICS: "/vendors/admin/analytics",
  VENDOR_ADMIN_STATS_BY_ID: (id: string) => `/vendors/admin/${id}/stats`,
} as const;

/**
 * Helper function to build query parameters
 */
export const buildAdminQueryParams = (
  params: Record<string, string | number | boolean | undefined>,
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export default adminApi;
