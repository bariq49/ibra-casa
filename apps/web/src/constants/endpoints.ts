/**
 * API Endpoint constants for the storefront.
 * Separated into logical groups for better modularity and type safety.
 */

export const MENU_ENDPOINTS = {
  PUBLIC: "/api/menus/public",
} as const;

export const BANNER_ENDPOINTS = {
  BASE: "/api/banners",
  BY_ID: (id: string) => `/api/banners/${id}`,
} as const;

export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  VERIFY_OTP: "/api/auth/verify-otp",
} as const;

export const PRODUCT_TYPE_ENDPOINTS = {
  BASE: "/api/product-types",
} as const;

export const PRODUCT_BASE_ENDPOINTS = {
  BASE: "/api/product-bases",
} as const;

export const PRODUCT_ENDPOINTS = {
  BASE: "/api/products",
  BY_ID: (id: string) => `/api/products/${id}`,
  REVIEW: (id: string) => `/api/products/${id}/review`,
  APPROVED_REVIEWS: "/api/products/reviews/approved",
  LIKE_REVIEW: (productId: string, reviewId: string) => `/api/products/${productId}/review/${reviewId}/like`,
  DISLIKE_REVIEW: (productId: string, reviewId: string) => `/api/products/${productId}/review/${reviewId}/dislike`,
  REPLY_REVIEW: (productId: string, reviewId: string) => `/api/products/${productId}/review/${reviewId}/reply`,
} as const;

export const CATEGORY_ENDPOINTS = {
  BASE: "/api/categories",
  TREE: "/api/categories/tree",
} as const;

export const BLOG_ENDPOINTS = {
  BASE: "/api/blogs",
} as const;

export const BRAND_ENDPOINTS = {
  BASE: "/api/brands",
} as const;

export const COLOR_ENDPOINTS = {
  BASE: "/api/colors",
} as const;

export const SIZE_ENDPOINTS = {
  BASE: "/api/sizes",
} as const;

export const WEIGHT_ENDPOINTS = {
  BASE: "/api/weights",
} as const;

export const CART_ENDPOINTS = {
  BASE: "/api/cart",
  ABANDONED: "/api/cart/abandoned",
} as const;

export const WISHLIST_ENDPOINTS = {
  BASE: "/api/wishlist",
  ADD: "/api/wishlist/add",
  REMOVE: "/api/wishlist/remove",
  PRODUCTS: "/api/wishlist/products",
  CLEAR: "/api/wishlist/clear",
} as const;

export const NOTIFICATION_ENDPOINTS = {
  BASE: "/api/notifications",
  UNREAD_COUNT: "/api/notifications/unread-count",
  READ_ALL: "/api/notifications/read-all",
  READ: (id: string) => `/api/notifications/${id}/read`,
} as const;

export const ORDER_ENDPOINTS = {
  BASE: "/api/orders",
  BY_ID: (id: string) => `/api/orders/${id}`,
} as const;

export const ADDRESS_ENDPOINTS = {
  BASE: "/api/addresses",
  BY_ID: (id: string) => `/api/addresses/${id}`,
  GET_PRIMARY: "/api/addresses/primary",
} as const;

export const CONTACT_ENDPOINTS = {
  BASE: "/api/contacts",
} as const;

export const SUBSCRIPTION_ENDPOINTS = {
  BASE: "/api/subscriptions",
  SUBSCRIBE: "/api/subscriptions/subscribe",
  UNSUBSCRIBE: "/api/subscriptions/unsubscribe",
} as const;

export const CURRENCY_ENDPOINTS = {
  BASE: "/api/currencies",
} as const;

/**
 * Unified API_ENDPOINTS object for backward compatibility and consolidated access.
 */
export const API_ENDPOINTS = {
  MENUS: MENU_ENDPOINTS,
  BANNERS: BANNER_ENDPOINTS,
  AUTH: AUTH_ENDPOINTS,
  PRODUCT_TYPES: PRODUCT_TYPE_ENDPOINTS,
  PRODUCT_BASES: PRODUCT_BASE_ENDPOINTS,
  PRODUCTS: PRODUCT_ENDPOINTS,
  CATEGORIES: CATEGORY_ENDPOINTS,
  BLOGS: BLOG_ENDPOINTS,
  BRANDS: BRAND_ENDPOINTS,
  COLORS: COLOR_ENDPOINTS,
  SIZES: SIZE_ENDPOINTS,
  WEIGHTS: WEIGHT_ENDPOINTS,
  CART: CART_ENDPOINTS,
  WISHLIST: WISHLIST_ENDPOINTS,
  NOTIFICATIONS: NOTIFICATION_ENDPOINTS,
  ORDERS: ORDER_ENDPOINTS,
  ADDRESSES: ADDRESS_ENDPOINTS,
  CONTACTS: CONTACT_ENDPOINTS,
  SUBSCRIPTIONS: SUBSCRIPTION_ENDPOINTS,
  CURRENCIES: CURRENCY_ENDPOINTS,
} as const;

export default API_ENDPOINTS;
