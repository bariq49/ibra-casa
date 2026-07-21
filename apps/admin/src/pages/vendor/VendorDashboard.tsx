import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  RefreshCw,
  ArrowRight,
  Eye,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatCurrencyWhole } from "@/lib/utils";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";

// Reuse the admin dashboard widgets so the visual language stays identical.
import { SummaryWidget } from "@/components/dashboard/SummaryWidget";
import { DashboardOrderStatus } from "@/components/dashboard/DashboardOrderStatus";
import { DashboardRevenueChart } from "@/components/dashboard/DashboardRevenueChart";

// ─── Types ──────────────────────────────────────────────────────────────────
interface MonthlyRevenuePoint {
  name: string;
  sales: number;
  orders: number;
}

interface OrderStatusCounts {
  pending: number;
  confirmed: number;
  delivering: number;
  delivered: number;
  completed: number;
  cancelled: number;
  packed: number;
  paid: number;
  address_confirmed: number;
}

interface RecentOrder {
  _id: string;
  customer: { name?: string; email?: string } | null;
  total: number;
  status: string;
  createdAt: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  image?: string;
  stock: number;
  price?: number;
}

interface VendorStats {
  year: number;
  counts: {
    products: number;
    pendingProducts: number;
    orders: number;
    customers: number;
    totalRevenue: number;
    abandonedCarts: number;
    paymentFailures: number;
    refundRequests: number;
    shippingDelays: number;
  };
  orderStatus: OrderStatusCounts;
  monthlyRevenue: MonthlyRevenuePoint[];
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}

const EMPTY_ORDER_STATUS: OrderStatusCounts = {
  pending: 0,
  confirmed: 0,
  delivering: 0,
  delivered: 0,
  completed: 0,
  cancelled: 0,
  packed: 0,
  paid: 0,
  address_confirmed: 0,
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const currentYear = new Date().getFullYear();
const AVAILABLE_YEARS = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-warning-lighter text-warning-dark border-warning-main/20";
    case "processing":
    case "confirmed":
    case "packed":
    case "address_confirmed":
      return "bg-info-lighter text-info-dark border-info-main/20";
    case "delivering":
      return "bg-secondary-lighter text-secondary-dark border-secondary-main/20";
    case "delivered":
    case "completed":
      return "bg-success-lighter text-success-dark border-success-main/20";
    case "cancelled":
      return "bg-error-lighter text-error-dark border-error-main/20";
    default:
      return "bg-grey-200 text-grey-800 border-grey-300";
  }
};

// ─── Component ─────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearLoading, setYearLoading] = useState(false);

  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  const fetchStats = useCallback(
    async (year: number, silent = false) => {
      if (!silent) setLoading(true);
      else setYearLoading(true);
      try {
        const { data } = await adminApi.get(
          `${ADMIN_API_ENDPOINTS.VENDOR_DASHBOARD_STATS}?year=${year}`,
        );
        setStats(data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Could not load statistics",
          description: "The API may be unavailable. Showing empty values.",
        });
        setStats(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setYearLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchStats(selectedYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    await fetchStats(year, true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats(selectedYear, true);
  };

  const recentOrders = stats?.recentOrders ?? [];
  const lowStockProducts = stats?.lowStockProducts ?? [];

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="space-y-6 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-2"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary-main to-primary-dark">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-grey-500 font-medium mt-1">
            Here's how your store is performing.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 h-9 rounded-full px-4 border-border text-sm"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </motion.div>

      {/* 8-Widget Grid */}
      <motion.div
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <SummaryWidget
            title="Total Sales"
            value={loading || !stats ? "—" : formatCurrencyWhole(stats.counts.totalRevenue)}
            bgColor="bg-[rgba(160,226,224,0.6)]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SummaryWidget
            title="Total Orders"
            value={loading || !stats ? "—" : stats.counts.orders.toLocaleString()}
            bgColor="bg-[rgba(255,235,105,0.6)]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SummaryWidget
            title="Total Customers"
            value={loading || !stats ? "—" : stats.counts.customers.toLocaleString()}
            bgColor="bg-[rgba(255,192,145,0.6)]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SummaryWidget
            title="Shipping Delays"
            value={loading || !stats ? "—" : stats.counts.shippingDelays.toLocaleString()}
            bgColor="bg-[rgba(255,214,239,0.6)]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SummaryWidget
            title="Refund Requests"
            value={loading || !stats ? "—" : stats.counts.refundRequests.toLocaleString()}
            bgColor="bg-[rgba(146,189,245,0.6)]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SummaryWidget
            title="Stock Products"
            value={loading || !stats ? "—" : stats.counts.products.toLocaleString()}
            bgColor="bg-[rgba(250,184,81,0.6)]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SummaryWidget
            title="Abandoned Carts"
            value={loading || !stats ? "—" : stats.counts.abandonedCarts.toLocaleString()}
            bgColor="bg-[rgba(158,232,114,0.6)]"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SummaryWidget
            title="Payment Failures"
            value={loading || !stats ? "—" : stats.counts.paymentFailures.toLocaleString()}
            bgColor="bg-[rgba(116,202,255,0.6)]"
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <motion.div
        className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-stretch"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="lg:col-span-1 h-full">
          <DashboardOrderStatus
            data={stats?.orderStatus ?? EMPTY_ORDER_STATUS}
            loading={loading}
          />
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-2 h-full">
          <DashboardRevenueChart
            data={stats?.monthlyRevenue ?? []}
            loading={yearLoading}
            selectedYear={selectedYear}
            availableYears={AVAILABLE_YEARS}
            onYearChange={handleYearChange}
          />
        </motion.div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold text-grey-900">
                Recent Orders
              </CardTitle>
            </div>
            <Link to="/vendor/orders">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-main hover:text-primary-dark hover:bg-primary-lighter text-xs font-semibold h-8 rounded-lg px-3"
              >
                View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <table className="hidden lg:table w-full text-sm text-left">
              <thead className="text-xs text-grey-500 uppercase bg-grey-50/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-grey-500"
                    >
                      No recent orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, i) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border-b border-border/50 hover:bg-grey-50/50 transition-colors last:border-0"
                    >
                      <td className="px-6 py-4 font-medium text-grey-900 whitespace-nowrap">
                        #ORD-{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-grey-700">
                        {order.customer?.name || "Guest Customer"}
                      </td>
                      <td className="px-6 py-4 text-grey-500">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-grey-900">
                        {formatCurrency(order.total || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`font-medium px-2.5 py-0.5 rounded-full border capitalize ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/vendor/orders/${order._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-grey-500 hover:text-primary-main rounded-full"
                            title="View order"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="lg:hidden flex flex-col divide-y divide-border">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
                <div className="px-4 py-8 text-center text-grey-500 text-sm">
                  No recent orders yet.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order._id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-grey-900 text-sm">
                          #ORD-{order._id.slice(-6).toUpperCase()}
                        </h4>
                        <p className="text-grey-500 text-xs mt-0.5">
                          {order.customer?.name || "Guest Customer"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`font-medium px-2 py-0.5 rounded-full border text-[10px] capitalize ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-end mt-3 pt-3 border-t border-border/40">
                      <p className="font-semibold text-grey-900 text-sm">
                        {formatCurrency(order.total || 0)}
                      </p>
                      <Link to={`/vendor/orders/${order._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-grey-50 hover:bg-primary-lighter text-grey-500 hover:text-primary-main rounded-full"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Low stock products */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning-main" />
              <CardTitle className="text-lg font-bold text-grey-900">
                Stock Alerts
              </CardTitle>
            </div>
            <Link to="/vendor/products/stock">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-main hover:text-primary-dark hover:bg-primary-lighter text-xs font-semibold h-8 rounded-lg px-3"
              >
                View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-grey-500 text-sm">
                No products yet.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {lowStockProducts.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-grey-50/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={16} className="text-grey-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-grey-900 truncate">
                        {p.name}
                      </div>
                      {p.price !== undefined && (
                        <div className="text-xs text-grey-500">{formatCurrency(p.price)}</div>
                      )}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-bold px-2.5 py-0.5 rounded-full",
                        p.stock === 0
                          ? "bg-error-lighter text-error-dark"
                          : p.stock < 5
                            ? "bg-warning-lighter text-warning-dark"
                            : "bg-grey-100 text-grey-700",
                      )}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
