import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { apiMonitorMiddleware } from "./middleware/apiMonitorMiddleware.js";
import { specs } from "./config/swagger.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import productTypeRoutes from "./routes/productTypeRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adsBannerRoutes from "./routes/adsBannerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import userAnalyticsRoutes from "./routes/userAnalyticsRoutes.js";
import orderWorkflowRoutes from "./routes/orderWorkflowRoutes.js";
import cashCollectionRoutes from "./routes/cashCollectionRoutes.js";
import userRoleRoutes from "./routes/userRoleRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import socialMediaRoutes from "./routes/socialMediaRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import websiteConfigRoutes from "./routes/websiteConfigRoutes.js";
import componentTypeRoutes from "./routes/componentTypeRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import websiteIconRoutes from "./routes/websiteIconRoutes.js";
import blogAuthorRoutes from "./routes/blogAuthorRoutes.js";
import blogCategoryRoutes from "./routes/blogCategoryRoutes.js";
import blogTagRoutes from "./routes/blogTagRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import bannerTypeRoutes from "./routes/bannerTypeRoutes.js";
import bannerPageRoutes from "./routes/bannerPageRoutes.js";
import sizeRoutes from "./routes/sizeRoutes.js";
import colorRoutes from "./routes/colorRoutes.js";
import weightRoutes from "./routes/weightRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";
import productBaseRoutes from "./routes/productBaseRoutes.js";
import pageBannerRoutes from "./routes/pageBannerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import systemMetricsRoutes from "./routes/systemMetricsRoutes.js";
import aboutPageRoutes from "./routes/aboutPageRoutes.js";
import careerPageRoutes from "./routes/careerPageRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import contactPageRoutes from "./routes/contactPageRoutes.js";
import teamMemberRoutes from "./routes/teamMemberRoutes.js";
import customerReviewRoutes from "./routes/customerReviewRoutes.js";
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js";
import setupRoutes from "./routes/setupRoutes.js";
import currencyRoutes from "./routes/currencyRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Set trust proxy for rate limiter to parse IPs correctly when behind proxies (Vercel, Nginx, load balancers)
app.set("trust proxy", 1);

// Security headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Required for images that might be loaded cross-origin

// Compression
app.use(compression());

// Enhanced CORS configuration
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  process.env.PRODUCTION_ADMIN_URL,
  process.env.PRODUCTION_CLIENT_URL,
  // Add production URLs - new domain
  "https://sellzy.reactbd.com",
  "https://admin.sellzy.reactbd.com",
  "https://api.sellzy.reactbd.com",

  // Add localhost for development
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081", // iOS simulator
  "http://10.0.2.2:8081", // Android emulator
  "http://10.0.2.2:8000", // Android emulator direct access
  // "http://192.168.1.100:8081", // Replace with your actual local IP for physical devices
].filter(Boolean) as string[]; // Remove any undefined values

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // Check if origin is in our allowed list or if it's a subdomain of reactbd.com
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".reactbd.com") ||
        origin.includes("localhost")
      ) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Origin not explicitly allowed: ${origin}`);
        // Instead of throwing an error which results in a 500 Internal Server Error,
        // we pass (null, false) to allow the browser to handle the CORS failure naturally.
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Stripe Webhook MUST be routed before express.json() to preserve the raw request buffer for signature verification
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

// Body size limit for JSON and URL-encoded payloads.
// Sized to accommodate base64-encoded image uploads (e.g. vendor product images)
// up to ~10 MB raw. base64 adds ~33% overhead, so a 10 MB file ≈ 13.4 MB encoded.
// 15mb leaves headroom for additional JSON fields without inviting payload DOS.
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Data Sanitization against NoSQL query injection
// Custom wrapper for express-mongo-sanitize to support Express 5.x
// where req.query is a read-only getter and standard assignment fails.
app.use((req, res, next) => {
  ["body", "params", "headers", "query"].forEach((key) => {
    const reqKey = key as keyof express.Request;
    if (req[reqKey]) {
      const sanitized = mongoSanitize.sanitize(req[reqKey]);
      try {
        // Try standard assignment first (works for body, params)
        // @ts-ignore
        req[reqKey] = sanitized;
      } catch (e) {
        // Fallback for read-only properties like req.query in Express 5
        Object.defineProperty(req, key, {
          value: sanitized,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }
  });
  next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Rate Limiting Config
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 2000, // Limit each IP to 2000 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Skip rate limiting for localhost during development
  skip: (req) => {
    const ip = req.ip || req.socket.remoteAddress || "";
    return (
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip === "::ffff:127.0.0.1" ||
      process.env.NODE_ENV === "development"
    );
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50, // Limit IP to 50 auth requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Apply general limiter to /api
app.use("/api/", apiLimiter);

// Additional headers for Swagger UI in production
app.use(
  "/api/docs",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
);

// APM Monitoring Middleware
app.use("/api", apiMonitorMiddleware);

// Routes
// Apply stricter rate limiter to auth routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/ads-banners", adsBannerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/product-types", productTypeRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/user-analytics", userAnalyticsRoutes);
app.use("/api/orders/workflow", orderWorkflowRoutes);
app.use("/api/cash-collections", cashCollectionRoutes);
app.use("/api/users/roles", userRoleRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/social-media", socialMediaRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/website-config", websiteConfigRoutes);
app.use("/api/component-types", componentTypeRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/website-icons", websiteIconRoutes);
app.use("/api/blog-authors", blogAuthorRoutes);
app.use("/api/blog-categories", blogCategoryRoutes);
app.use("/api/blog-tags", blogTagRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/banner-types", bannerTypeRoutes);
app.use("/api/banner-pages", bannerPageRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/sizes", sizeRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/weights", weightRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/product-bases", productBaseRoutes);
app.use("/api/page-banners", pageBannerRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/system-metrics", systemMetricsRoutes);
app.use("/api/about-page", aboutPageRoutes);
app.use("/api/career-page", careerPageRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/applications", jobApplicationRoutes);
app.use("/api/contact-page", contactPageRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/customer-reviews", customerReviewRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/currencies", currencyRoutes);

// API Documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .scheme-container { background: #fafafa; padding: 30px 0 }
    `,
    customSiteTitle: "Sellzy API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  }),
);

// Home route
app.get("/", (req: express.Request, res: express.Response) => {
  res.json({
    message: "Sellzy API is running...",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    docs: `${req.protocol}://${req.get("host")}/api/docs`,
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      products: "/api/products",
      categories: "/api/categories",
      brands: "/api/brands",
      upload: "/api/upload",
      docs: "/api/docs",
    },
  });
});

// Health check route
app.get("/health", (req: express.Request, res: express.Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
});

// Swagger docs redirect and info
app.get("/docs", (req: express.Request, res: express.Response) => {
  res.redirect("/api/docs");
});

app.get("/api/docs.json", (req: express.Request, res: express.Response) => {
  res.json(specs);
});

app.get("/api/docs/info", (req: express.Request, res: express.Response) => {
  res.json({
    swagger: "Available",
    url: `${req.protocol}://${req.get("host")}/api/docs`,
    specs: specs ? "Loaded" : "Not loaded",
    environment: process.env.NODE_ENV,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });
}

export default app;
