import { useState, useEffect, useCallback } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { getRoleDashboardMessage } from "@/lib/rolePermissions";
import { motion } from "framer-motion";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";
import { SummaryWidget } from "@/components/dashboard/SummaryWidget";
import { DashboardOrderStatus } from "@/components/dashboard/DashboardOrderStatus";
import { DashboardRevenueChart } from "@/components/dashboard/DashboardRevenueChart";
import { RecentOrdersList } from "@/components/dashboard/RecentOrdersList";
import { LowStockProductsList } from "@/components/dashboard/LowStockProductsList";
import { VendorManagementCard } from "@/components/dashboard/VendorManagementCard";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrencyWhole } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────
interface MonthlyRevenuePoint {
  name: string;
  sales: number;
  orders: number;
}

interface OrderStatus {
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

interface StatsData {
  counts: {
    users: number;
    products: number;
    categories: number;
    brands: number;
    orders: number;
    totalRevenue: number;
    abandonedCarts?: number;
    paymentFailures?: number;
    refundRequests?: number;
    shippingDelays?: number;
  };
  orderStatus: OrderStatus;
  monthlyRevenue: MonthlyRevenuePoint[];
  year: number;
  roles: { name: string; value: number }[];
  categories: { name: string; value: number }[];
  brands: { name: string; value: number }[];
}

const EMPTY_ORDER_STATUS: OrderStatus = {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearLoading, setYearLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);

  const dashboardMessage = getRoleDashboardMessage(
    user?.role || "",
    user?.employee_role || null
  );

  // ── Fetch stats from API ─────────────────────────────────────────────────
  const fetchStats = useCallback(
    async (year: number, silent = false) => {
      if (!silent) setLoading(true);
      else setYearLoading(true);
      try {
        const response = await axiosPrivate.get(`/stats?year=${year}`);
        setStats(response.data);
      } catch (error) {
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
    [axiosPrivate, toast]
  );

  useEffect(() => {
    fetchStats(selectedYear);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Year change (re-fetch with new year) ─────────────────────────────────
  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    await fetchStats(year, true);
  };

  // ── Refresh ──────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats(selectedYear, true);
  };

  // ─── Derived widget values ────────────────────────────────────────────────
  const totalSales = stats
    ? formatCurrencyWhole(stats.counts.totalRevenue)
    : "—";
  const totalOrders = stats ? stats.counts.orders.toLocaleString() : "—";
  const totalCustomers = stats ? stats.counts.users.toLocaleString() : "—";
  const totalProducts = stats ? stats.counts.products.toLocaleString() : "—";
  const abandonedCarts = stats
    ? (stats.counts.abandonedCarts || 0).toLocaleString()
    : "—";
  const shippingDelays = stats
    ? (stats.counts.shippingDelays || 0).toLocaleString()
    : "—";
  const refundRequests = stats
    ? (stats.counts.refundRequests || 0).toLocaleString()
    : "—";
  const paymentFailures = stats
    ? (stats.counts.paymentFailures || 0).toLocaleString()
    : "—";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="min-h-screen bg-grey-100 p-6 font-sans space-y-6 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary-main to-primary-dark">
                {dashboardMessage.title}
              </h1>
              <p className="text-grey-500 font-medium mt-1">
                {dashboardMessage.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 h-9 rounded-full px-4 border-border text-sm"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </motion.div>

          {/* ── 8-Widget Grid ──────────────────────────────────────────── */}
          <motion.div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Total Sales"
                value={totalSales}
                trend={0}
                bgColor="bg-[rgba(160,226,224,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Total Orders"
                value={totalOrders}
                trend={0}
                bgColor="bg-[rgba(255,235,105,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Total Customers"
                value={totalCustomers}
                trend={0}
                bgColor="bg-[rgba(255,192,145,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Shipping Delays"
                value={shippingDelays}
                trend={0}
                bgColor="bg-[rgba(255,214,239,0.6)]"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Refund Requests"
                value={refundRequests}
                trend={0}
                bgColor="bg-[rgba(146,189,245,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Stock Products"
                value={totalProducts}
                trend={0}
                bgColor="bg-[rgba(250,184,81,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Abandoned Carts"
                value={abandonedCarts}
                trend={0}
                bgColor="bg-[rgba(158,232,114,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Payment Failures"
                value={paymentFailures}
                trend={0}
                bgColor="bg-[rgba(116,202,255,0.6)]"
              />
            </motion.div>
          </motion.div>

          {/* ── Charts Row ─────────────────────────────────────────────── */}
          <motion.div
            className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-stretch"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="lg:col-span-1 h-full">
              <DashboardOrderStatus
                data={stats?.orderStatus ?? EMPTY_ORDER_STATUS}
                loading={false}
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

          {/* ── Vendor management quick-access ───────────────────────────── */}
          <motion.div variants={itemVariants} className="w-full">
            <VendorManagementCard />
          </motion.div>

          {/* ── Lists ───────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="w-full">
            <RecentOrdersList />
          </motion.div>

          <motion.div variants={itemVariants} className="w-full">
            <LowStockProductsList />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
