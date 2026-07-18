import { useState, useEffect, useCallback } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { getRoleDashboardMessage } from "@/lib/rolePermissions";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSkeleton from "@/components/skeleton/DashboardSkeleton";
import { SummaryWidget } from "@/components/dashboard/SummaryWidget";
import { DashboardOrderStatus } from "@/components/dashboard/DashboardOrderStatus";
import { DashboardRevenueChart } from "@/components/dashboard/DashboardRevenueChart";
import { RecentOrdersList } from "@/components/dashboard/RecentOrdersList";
import { LowStockProductsList } from "@/components/dashboard/LowStockProductsList";
import { VendorManagementCard } from "@/components/dashboard/VendorManagementCard";
import { FlaskConical, BarChart2, RefreshCw } from "lucide-react";
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

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_STATS: StatsData = {
  counts: {
    users: 8642,
    products: 3420,
    categories: 48,
    brands: 112,
    orders: 12850,
    totalRevenue: 984230,
  },
  orderStatus: {
    pending: 280,
    confirmed: 340,
    delivering: 210,
    delivered: 620,
    completed: 450,
    cancelled: 95,
    packed: 180,
    paid: 520,
    address_confirmed: 155,
  },
  monthlyRevenue: [
    { name: "Jan", sales: 4200, orders: 38 },
    { name: "Feb", sales: 3800, orders: 31 },
    { name: "Mar", sales: 5100, orders: 47 },
    { name: "Apr", sales: 4700, orders: 43 },
    { name: "May", sales: 6200, orders: 58 },
    { name: "Jun", sales: 5900, orders: 54 },
    { name: "Jul", sales: 7100, orders: 65 },
    { name: "Aug", sales: 8400, orders: 78 },
    { name: "Sep", sales: 7600, orders: 70 },
    { name: "Oct", sales: 9200, orders: 85 },
    { name: "Nov", sales: 11500, orders: 106 },
    { name: "Dec", sales: 13800, orders: 128 },
  ],
  year: new Date().getFullYear(),
  roles: [],
  categories: [],
  brands: [],
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
  const [isDemoMode, setIsDemoMode] = useState(false);
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
          description: "Using demo data as fallback. The API may be unavailable.",
        });
        // If API fails, silently switch to demo mode so page is never blank
        setIsDemoMode(true);
        setStats(DEMO_STATS);
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
    if (!isDemoMode) {
      await fetchStats(year, true);
    }
  };

  // ── Refresh ──────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats(selectedYear, true);
  };

  // ── Active display data (demo OR real) ───────────────────────────────────
  const displayStats = isDemoMode ? DEMO_STATS : (stats ?? DEMO_STATS);

  // ─── Derived widget values ────────────────────────────────────────────────
  const totalSales = formatCurrencyWhole(displayStats.counts.totalRevenue);
  const totalOrders = displayStats.counts.orders.toLocaleString();
  const totalCustomers = displayStats.counts.users.toLocaleString();
  const totalProducts = displayStats.counts.products.toLocaleString();

  // Use API values if available, otherwise use demo
  const abandonedCarts = isDemoMode ? "128" : (displayStats.counts.abandonedCarts || 0).toLocaleString();
  const shippingDelays = isDemoMode ? "42" : (displayStats.counts.shippingDelays || 0).toLocaleString();
  const refundRequests = isDemoMode ? "15" : (displayStats.counts.refundRequests || 0).toLocaleString();
  const paymentFailures = isDemoMode ? "8" : (displayStats.counts.paymentFailures || 0).toLocaleString();

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
              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || isDemoMode}
                className="flex items-center gap-1.5 h-9 rounded-full px-4 border-border text-sm"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>

              {/* Demo / Real toggle */}
              <AnimatePresence mode="wait">
                {isDemoMode ? (
                  <motion.div
                    key="real-btn"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      size="sm"
                      onClick={() => setIsDemoMode(false)}
                      className="flex items-center gap-2 h-9 rounded-full px-4 bg-primary-main hover:bg-primary-dark text-white shadow-sm shadow-primary-main/20"
                    >
                      <BarChart2 className="h-3.5 w-3.5" />
                      Show Real Data
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="demo-btn"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDemoMode(true)}
                      className="flex items-center gap-2 h-9 rounded-full px-4 border-warning-main/30 bg-warning-lighter/50 text-warning-dark hover:bg-warning-lighter"
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                      Preview Demo Data
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Demo mode notice banner */}
          <AnimatePresence>
            {isDemoMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 bg-warning-lighter border border-warning-main/30 rounded-xl px-5 py-3 text-warning-dark">
                  <FlaskConical className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">
                    You are viewing <span className="font-bold">demo / sample data</span>. Click{" "}
                    <button
                      onClick={() => setIsDemoMode(false)}
                      className="underline font-bold hover:text-warning-darker"
                    >
                      Show Real Data
                    </button>{" "}
                    to see live statistics from the database.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 8-Widget Grid ──────────────────────────────────────────── */}
          <motion.div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Total Sales"
                value={totalSales}
                trend={isDemoMode ? 0.12 : 0}
                bgColor="bg-[rgba(160,226,224,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Total Orders"
                value={totalOrders}
                trend={isDemoMode ? -0.05 : 0}
                bgColor="bg-[rgba(255,235,105,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Total Customers"
                value={totalCustomers}
                trend={isDemoMode ? 0.08 : 0}
                bgColor="bg-[rgba(255,192,145,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Shipping Delays"
                value={shippingDelays}
                trend={isDemoMode ? -0.1 : 0}
                bgColor="bg-[rgba(255,214,239,0.6)]"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Refund Requests"
                value={refundRequests}
                trend={isDemoMode ? 0.05 : 0}
                bgColor="bg-[rgba(146,189,245,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Stock Products"
                value={totalProducts}
                trend={isDemoMode ? -0.07 : 0}
                bgColor="bg-[rgba(250,184,81,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Abandoned Carts"
                value={abandonedCarts}
                trend={isDemoMode ? 0.03 : 0}
                bgColor="bg-[rgba(158,232,114,0.6)]"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryWidget
                title="Payment Failures"
                value={paymentFailures}
                trend={isDemoMode ? -0.15 : 0}
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
                data={displayStats.orderStatus}
                loading={false}
                isDemoMode={isDemoMode}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="lg:col-span-2 h-full">
              <DashboardRevenueChart
                data={displayStats.monthlyRevenue}
                loading={yearLoading}
                isDemoMode={isDemoMode}
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
