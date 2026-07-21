import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router";
import { useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";
import StoreSettingsProvider from "@/components/StoreSettingsProvider";
import { PermissionsProvider } from "@/hooks/usePermissions";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AccountPage from "@/pages/dashboard/AccountPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import EmployeesPage from "@/pages/dashboard/EmployeesPage";
import SalariesPage from "@/pages/dashboard/SalariesPage";
import ProductsPage from "@/pages/dashboard/ProductsPage";
import CategoriesPage from "@/pages/dashboard/CategoriesPage";
import BrandsPage from "@/pages/dashboard/BrandsPage";
import ProductTypesPage from "@/pages/dashboard/ProductTypesPage";
import ProductBasesPage from "@/pages/dashboard/ProductBasesPage";
import SizesPage from "@/pages/dashboard/SizesPage";
import ColorsPage from "@/pages/dashboard/ColorsPage";
import WeightsPage from "@/pages/dashboard/WeightsPage";
import BadgesPage from "@/pages/dashboard/BadgesPage";
import TodaysOfferPage from "@/pages/dashboard/TodaysOfferPage";
import OrdersPage from "@/pages/dashboard/Orders";
import BannerTypesPage from "@/pages/dashboard/BannerTypesPage";
import AboutPageConfig from "./pages/dashboard/config/AboutPageConfig";
import CareerPageConfig from "./pages/dashboard/config/CareerPageConfig";
import MenusPage from "./pages/dashboard/MenusPage";
import BannersPage from "./pages/dashboard/BannersPage";
import InvoicePage from "./pages/dashboard/InvoicePage";
import ReviewsPage from "./pages/dashboard/ReviewsPage";
import SearchPage from "./pages/dashboard/SearchPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import PurchasesPage from "./pages/dashboard/PurchasesPage";
import { PurchaseDashboardPage } from "./pages/dashboard/purchases/PurchaseDashboardPage";
import CreatePurchasePage from "./pages/dashboard/purchases/CreatePurchasePage";
import ApprovedPurchasePage from "./pages/dashboard/purchases/ApprovedPurchasePage";
import PurchasedItemsPage from "./pages/dashboard/purchases/PurchasedItemsPage";
import SuppliersPage from "./pages/dashboard/purchases/SuppliersPage";
import VendorsPage from "./pages/dashboard/VendorsPage";
import VendorDetailPage from "./pages/dashboard/VendorDetailPage";
import VendorProductsPage from "./pages/dashboard/VendorProductsPage";
import VendorAnalyticsPage from "./pages/dashboard/VendorAnalyticsPage";
import VendorConfigPage from "./pages/dashboard/VendorConfigPage";
import BlogAuthorsPage from "./pages/dashboard/blog/BlogAuthorsPage";
import BlogCategoriesPage from "./pages/dashboard/blog/BlogCategoriesPage";
import BlogTagsPage from "./pages/dashboard/blog/BlogTagsPage";
import BlogPostsPage from "./pages/dashboard/blog/BlogPostsPage";
import QCPage from "./pages/dashboard/QCPage";
import AbandonedCartPage from "./pages/dashboard/AbandonedCartPage";
import UsersPage from "@/pages/dashboard/UsersPage";
import AdminsPage from "@/pages/dashboard/AdminsPage";
import SubscriptionsPage from "@/pages/dashboard/SubscriptionsPage";
import AddressesPage from "@/pages/dashboard/AddressesPage";
import CouponPage from "./pages/dashboard/promotions/CouponPage";
import SystemMetricsPage from "./pages/dashboard/api-config/SystemMetricsPage";
import CareersPage from "./pages/dashboard/careers/CareersPage";

// Vendor portal
import VendorLayout from "@/components/layouts/VendorLayout";
import VendorDashboard from "@/pages/vendor/VendorDashboard";
import VendorProducts from "@/pages/vendor/products/VendorProducts";
import VendorProductCreate from "@/pages/vendor/products/VendorProductCreate";
import VendorProductEdit from "@/pages/vendor/products/VendorProductEdit";
import VendorProductDetails from "@/pages/vendor/products/VendorProductDetails";
import VendorOrders from "@/pages/vendor/orders/VendorOrders";
import VendorOrderDetails from "@/pages/vendor/orders/VendorOrderDetails";
import VendorEarnings from "@/pages/vendor/VendorEarnings";
import VendorStaff from "@/pages/vendor/VendorStaff";
import VendorReports from "@/pages/vendor/VendorReports";
import VendorSettings from "@/pages/vendor/VendorSettings";
import VendorComingSoon from "@/pages/vendor/ComingSoon";

function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (path === "/login") {
      document.title = "Sellzy Admin | Login";
      return;
    }
    if (path === "/register") {
      document.title = "Sellzy Admin | Register";
      return;
    }
    if (path === "/forgot-password") {
      document.title = "Sellzy Admin | Forgot Password";
      return;
    }

    const parts = path.split("/").filter(Boolean);
    if (
      parts.length === 0 ||
      (parts.length === 1 && parts[0] === "dashboard")
    ) {
      document.title = "Sellzy Admin | Dashboard";
      return;
    }

    const lastPart = parts[parts.length - 1];

    if (lastPart.toLowerCase() === "qc") {
      document.title = "Sellzy Admin | QC";
      return;
    }

    const title = lastPart
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    document.title = `Sellzy Admin | ${title}`;
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-dashboard-theme">
      <StoreSettingsProvider>
        <PermissionsProvider>
          <Outlet />
        </PermissionsProvider>
      </StoreSettingsProvider>
    </ThemeProvider>
  );
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route
          path="menus"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MenusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="customers"
          element={<Navigate to="/dashboard/users" replace />}
        />
        <Route path="users" element={<UsersPage />} />
        <Route path="admins" element={<AdminsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="salaries" element={<SalariesPage />} />
        <Route
          path="orders-dashboard"
          element={<OrdersPage isDashboard={true} />}
        />
        <Route path="orders" element={<OrdersPage isDashboard={false} />} />
        <Route path="abandoned-cart" element={<AbandonedCartPage />} />
        <Route path="invoices" element={<InvoicePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="banner-types" element={<BannerTypesPage />} />
        <Route path="about-page" element={<AboutPageConfig />} />
        <Route path="career-page" element={<CareerPageConfig />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="product-types" element={<ProductTypesPage />} />
        <Route path="product-bases" element={<ProductBasesPage />} />
        <Route path="sizes" element={<SizesPage />} />
        <Route path="colors" element={<ColorsPage />} />
        <Route path="weights" element={<WeightsPage />} />
        <Route path="badges" element={<BadgesPage />} />
        <Route path="todays-offer" element={<TodaysOfferPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="purchases/dashboard" element={<PurchaseDashboardPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/create" element={<CreatePurchasePage />} />
        <Route path="purchases/approved" element={<ApprovedPurchasePage />} />
        <Route path="purchases/purchased" element={<PurchasedItemsPage />} />
        <Route path="purchases/suppliers" element={<SuppliersPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="vendors/:id" element={<VendorDetailPage />} />
        <Route path="vendor-products" element={<VendorProductsPage />} />
        <Route path="vendor-analytics" element={<VendorAnalyticsPage />} />
        <Route path="vendor-config" element={<VendorConfigPage />} />
        <Route path="qc" element={<QCPage />} />

        {/* Blog Routes */}
        <Route path="blog/authors" element={<BlogAuthorsPage />} />
        <Route path="blog/categories" element={<BlogCategoriesPage />} />
        <Route path="blog/tags" element={<BlogTagsPage />} />
        <Route path="blog/posts" element={<BlogPostsPage />} />

        {/* Promotions Routes */}
        <Route path="promotions/coupon" element={<CouponPage />} />

        {/* API Config Routes */}
        <Route
          path="api-config/system-metrics"
          element={<SystemMetricsPage />}
        />
      </Route>

      {/* Vendor Portal Routes */}
      <Route path="/vendor" element={<VendorLayout />}>
        <Route index element={<VendorDashboard />} />

        {/* Products */}
        <Route path="products" element={<VendorProducts tab="all" />} />
        <Route path="products/draft" element={<VendorProducts tab="draft" />} />
        <Route path="products/stock" element={<VendorProducts tab="stock" />} />
        <Route
          path="products/review"
          element={<VendorProducts tab="review" />}
        />
        <Route path="products/new" element={<VendorProductCreate />} />
        <Route path="products/:id" element={<VendorProductDetails />} />
        <Route path="products/:id/edit" element={<VendorProductEdit />} />

        {/* Catalog (placeholder) */}
        <Route
          path="catalog/categories"
          element={<VendorComingSoon title="Categories" />}
        />
        <Route
          path="catalog/attributes"
          element={<VendorComingSoon title="Attributes" />}
        />
        <Route
          path="catalog/tags"
          element={<VendorComingSoon title="Tags" />}
        />
        <Route
          path="catalog/brands"
          element={<VendorComingSoon title="Brands" />}
        />
        <Route
          path="inventory"
          element={<VendorComingSoon title="Manage Inventory" />}
        />

        {/* Orders */}
        <Route path="orders" element={<VendorOrders />} />
        <Route path="orders/:id" element={<VendorOrderDetails />} />
        <Route
          path="orders/returns"
          element={<VendorComingSoon title="Returns & Refunds" />}
        />
        <Route
          path="orders/abandoned"
          element={<VendorComingSoon title="Abandoned Cart" />}
        />
        <Route
          path="transactions"
          element={<VendorComingSoon title="Transactions" />}
        />

        {/* User mgmt / reports */}
        <Route path="staff" element={<VendorStaff />} />
        <Route path="reports" element={<VendorReports />} />

        {/* Finance */}
        <Route path="earnings" element={<VendorEarnings />} />
        <Route
          path="withdraws"
          element={<VendorComingSoon title="Withdraws" />}
        />
        <Route path="refunds" element={<VendorComingSoon title="Refunds" />} />

        {/* Promotions / inbox */}
        <Route path="coupons" element={<VendorComingSoon title="Coupons" />} />
        <Route path="inbox" element={<VendorComingSoon title="Inbox" />} />

        {/* Settings */}
        <Route path="settings" element={<VendorSettings />} />
      </Route>

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>,
  ),
);
