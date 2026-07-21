import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Wallet, TrendingDown, BarChart3, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatCurrencyWhole } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";

type VendorOrder = {
  _id: string;
  createdAt: string;
  paymentStatus: string;
  paymentMethod: string;
  vendorSubtotal: number;
  platformCut: number;
  vendorPayout: number;
};

const STATS = [
  {
    key: "income",
    label: "Total Income",
    icon: Wallet,
    bg: "bg-[#CAF8E4]",
    iconClass: "bg-primary-lighter text-primary-dark",
  },
  {
    key: "expenses",
    label: "Total Expenses",
    icon: TrendingDown,
    bg: "bg-[#FFE4E1]",
    iconClass: "bg-error-lighter text-error-dark",
  },
  {
    key: "revenue",
    label: "Total Revenue",
    icon: BarChart3,
    bg: "bg-[#FEF3C7]",
    iconClass: "bg-warning-lighter text-warning-dark",
  },
  {
    key: "average",
    label: "Average Earning",
    icon: Activity,
    bg: "bg-[#E0E7FF]",
    iconClass: "bg-secondary-lighter text-secondary-dark",
  },
] as const;

export default function VendorEarnings() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    adminApi
      .get(ADMIN_API_ENDPOINTS.VENDOR_ORDERS)
      .then(({ data }) => active && setOrders(data?.orders ?? []))
      .catch(() => active && setOrders([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const income = orders.reduce((s, o) => s + o.vendorSubtotal, 0);
    const expenses = orders.reduce((s, o) => s + o.platformCut, 0);
    const revenue = income - expenses;
    const average = orders.length ? revenue / orders.length : 0;
    return { income, expenses, revenue, average };
  }, [orders]);

  const chart = useMemo(() => {
    const buckets: Record<string, { earning: number; expenses: number }> = {};
    for (const o of orders) {
      const month = new Date(o.createdAt).toLocaleString("en", { month: "short" });
      if (!buckets[month]) buckets[month] = { earning: 0, expenses: 0 };
      buckets[month].earning += o.vendorPayout;
      buckets[month].expenses += o.platformCut;
    }
    const order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return order
      .filter((m) => buckets[m])
      .map((m) => ({ month: m, ...buckets[m] }));
  }, [orders]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-grey-900">Earning</h1>
        <p className="text-sm text-grey-500">
          Income, platform commission, and payouts.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          const value = (() => {
            if (loading) return null;
            const v = stats[s.key];
            return formatCurrencyWhole(v);
          })();
          return (
            <div key={s.key} className={`${s.bg} rounded-2xl p-5`}>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconClass} mb-3`}
              >
                <Icon size={18} />
              </div>
              <div className="text-sm font-medium text-grey-700">{s.label}</div>
              <div className="text-2xl font-bold text-grey-900 mt-1">
                {loading ? <Skeleton className="h-7 w-20" /> : value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-background rounded-2xl border border-border p-5">
        <h3 className="font-semibold text-grey-900 mb-4">Accommodation Revenue</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#088178" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#088178" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC107" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FFC107" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="earning"
                stroke="#088178"
                strokeWidth={2}
                fill="url(#earnFill)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#FFC107"
                strokeWidth={2}
                fill="url(#expFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border p-5 overflow-x-auto">
        <h3 className="font-semibold text-grey-900 mb-3">Transactions</h3>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>ID</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Platform cut</TableHead>
              <TableHead className="text-right">Payout</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-grey-500">
                  No transactions yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="text-xs text-grey-500">
                    #{o._id.slice(-5)}
                  </TableCell>
                  <TableCell className="uppercase text-sm">
                    {o.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        o.paymentStatus === "paid" || o.paymentStatus === "cod_collected"
                          ? "bg-success-lighter text-success-dark"
                          : "bg-warning-lighter text-warning-dark"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(o.vendorSubtotal)}
                  </TableCell>
                  <TableCell className="text-right text-error-dark">
                    − {formatCurrency(o.platformCut)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary-main">
                    {formatCurrency(o.vendorPayout)}
                  </TableCell>
                  <TableCell className="text-sm text-grey-600">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
