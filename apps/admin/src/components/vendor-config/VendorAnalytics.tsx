import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  DollarSign,
  TrendingUp,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn, formatCurrencyWhole } from "@/lib/utils";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";

interface AdminVendorAnalytics {
  year: number;
  statusCounts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
  revenue: {
    total: number;
    commission: number;
    vendorPayout: number;
  };
  approvalFunnel: {
    applied: number;
    approved: number;
    rejected: number;
    suspended: number;
    pending: number;
    approvalRate: number;
  };
  topVendors: Array<{
    _id: string;
    storeName: string;
    logo?: string;
    status: string;
    owner: { name?: string; email?: string } | null;
    revenue: number;
    commission: number;
    payout: number;
    orders: number;
  }>;
  monthlyTrend: Array<{
    name: string;
    revenue: number;
    commission: number;
    orders: number;
    signups: number;
  }>;
}

const FUNNEL_COLORS = ["#FFC107", "#54D62C", "#CB0233", "#94A3B8"];
const TOP_N = 8;

const EMPTY_ANALYTICS: AdminVendorAnalytics = {
  year: new Date().getFullYear(),
  statusCounts: { total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 },
  revenue: { total: 0, commission: 0, vendorPayout: 0 },
  approvalFunnel: {
    applied: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    pending: 0,
    approvalRate: 0,
  },
  topVendors: [],
  monthlyTrend: [],
};

function StatCard({
  icon: Icon,
  label,
  value,
  bg,
  iconClass,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  bg: string;
  iconClass: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-5 flex items-start justify-between`}>
      <div>
        <div className="text-sm font-medium text-grey-700">{label}</div>
        <div className="text-2xl font-bold text-grey-900 mt-1">{value}</div>
      </div>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
      >
        <Icon size={18} />
      </div>
    </div>
  );
}

export default function VendorAnalytics() {
  const [data, setData] = useState<AdminVendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(false);

  const fetchAnalytics = (y: number, silent = false) => {
    let active = true;
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(false);
    adminApi
      .get(`${ADMIN_API_ENDPOINTS.VENDOR_ADMIN_ANALYTICS}?year=${y}&topN=${TOP_N}`)
      .then((res) => {
        if (active) {
          setData(res.data);
          setError(false);
        }
      })
      .catch(() => {
        if (active) {
          setData(null);
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => {
      active = false;
    };
  };

  useEffect(() => {
    const cleanup = fetchAnalytics(year);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const display = data ?? EMPTY_ANALYTICS;

  const funnelData = [
    { name: "Pending", value: display.approvalFunnel.pending },
    { name: "Approved", value: display.approvalFunnel.approved },
    { name: "Rejected", value: display.approvalFunnel.rejected },
    { name: "Suspended", value: display.approvalFunnel.suspended },
  ];

  const yearOptions = [year, year - 1, year - 2, year - 3];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-1.5 bg-grey-100 border-none rounded-full text-sm font-semibold text-grey-700 outline-hidden cursor-pointer"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(year, true)}
            disabled={refreshing}
            className="rounded-full h-9"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 mr-1.5", refreshing && "animate-spin")}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {error && !loading && (
        <div className="rounded-xl border border-error-main/30 bg-error-lighter px-5 py-3 text-sm text-error-dark">
          Could not load vendor analytics. Showing empty values.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total Vendors"
          value={loading ? "—" : display.statusCounts.total.toLocaleString()}
          icon={Store}
          bg="bg-[#E0E7FF]"
          iconClass="bg-secondary-lighter text-secondary-dark"
        />
        <StatCard
          label="Pending"
          value={loading ? "—" : display.statusCounts.pending.toLocaleString()}
          icon={Clock}
          bg="bg-[#FFF3CD]"
          iconClass="bg-warning-lighter text-warning-dark"
        />
        <StatCard
          label="Approved"
          value={loading ? "—" : display.statusCounts.approved.toLocaleString()}
          icon={CheckCircle2}
          bg="bg-[#D1FADF]"
          iconClass="bg-success-lighter text-success-dark"
        />
        <StatCard
          label="Rejected"
          value={loading ? "—" : display.statusCounts.rejected.toLocaleString()}
          icon={XCircle}
          bg="bg-[#FFE4E1]"
          iconClass="bg-error-lighter text-error-dark"
        />
        <StatCard
          label="Suspended"
          value={loading ? "—" : display.statusCounts.suspended.toLocaleString()}
          icon={Pause}
          bg="bg-[#FED7AA]"
          iconClass="bg-warning-lighter text-warning-dark"
        />
        <StatCard
          label="Approval Rate"
          value={
            loading
              ? "—"
              : `${display.approvalFunnel.approvalRate.toFixed(1)}%`
          }
          icon={TrendingUp}
          bg="bg-[#CAF8E4]"
          iconClass="bg-primary-lighter text-primary-dark"
        />
      </div>

      {/* Revenue cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
          label="Gross Sales"
          value={loading ? "—" : formatCurrencyWhole(display.revenue.total)}
          icon={DollarSign}
          bg="bg-[rgba(146,189,245,0.55)]"
          iconClass="bg-info-lighter text-info-dark"
        />
        <StatCard
          label="Platform Commission"
          value={loading ? "—" : formatCurrencyWhole(display.revenue.commission)}
          icon={DollarSign}
          bg="bg-[rgba(255,235,105,0.6)]"
          iconClass="bg-warning-lighter text-warning-dark"
        />
        <StatCard
          label="Vendor Payouts"
          value={loading ? "—" : formatCurrencyWhole(display.revenue.vendorPayout)}
          icon={DollarSign}
          bg="bg-[rgba(160,226,224,0.6)]"
          iconClass="bg-primary-lighter text-primary-dark"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50">
            <CardTitle className="text-base font-bold text-grey-900">
              Monthly trend
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Revenue, commission, and signups
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : display.monthlyTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No monthly trend data.
              </p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={display.monthlyTrend}>
                    <defs>
                      <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#088178" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#088178" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="adminComm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFC107" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#FFC107" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F1F5F9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#088178"
                      strokeWidth={2}
                      fill="url(#adminRev)"
                    />
                    <Area
                      type="monotone"
                      dataKey="commission"
                      stroke="#FFC107"
                      strokeWidth={2}
                      fill="url(#adminComm)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval funnel */}
        <Card>
          <CardHeader className="py-4 border-b border-border/50">
            <CardTitle className="text-base font-bold text-grey-900">
              Approval funnel
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribution of {display.approvalFunnel.applied} applications
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={funnelData}
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={4}
                      stroke="none"
                    >
                      {funnelData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top vendors leaderboard */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50">
          <CardTitle className="text-base font-bold text-grey-900 flex items-center gap-2">
            <Trophy size={16} className="text-warning-main" />
            Top vendors by revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : !display.topVendors.length ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No vendor revenue yet.
            </p>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={display.topVendors} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F1F5F9"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatCurrencyWhole(v)}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis
                      dataKey="storeName"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={120}
                      tick={{ fontSize: 12, fill: "#475569" }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrencyWhole(Number(value))}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#088178"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-5 divide-y divide-border">
                {display.topVendors.map((v, idx) => (
                  <div
                    key={v._id}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-grey-100 text-grey-700 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    {v.logo ? (
                      <img
                        src={v.logo}
                        alt={v.storeName}
                        className="w-8 h-8 rounded-lg object-cover bg-muted"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary-lighter text-primary-dark flex items-center justify-center">
                        <Store size={14} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-grey-900 truncate">
                        {v.storeName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {v.owner?.email || "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary-main">
                        {formatCurrencyWhole(v.revenue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {v.orders} orders
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
