import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Eye, Package, Clock, Truck, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";

type VendorOrder = {
  _id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  customer?: { name?: string; email?: string };
  vendorItems: Array<{ name: string; price: number; quantity: number }>;
  vendorSubtotal: number;
  platformCut: number;
  vendorPayout: number;
};

const STATUS_PILLS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-warning-lighter", text: "text-warning-dark" },
  processing: { bg: "bg-info-lighter", text: "text-info-dark" },
  confirmed: { bg: "bg-info-lighter", text: "text-info-dark" },
  packed: { bg: "bg-info-lighter", text: "text-info-dark" },
  delivering: { bg: "bg-secondary-lighter", text: "text-secondary-dark" },
  delivered: { bg: "bg-success-lighter", text: "text-success-dark" },
  completed: { bg: "bg-success-lighter", text: "text-success-dark" },
  cancelled: { bg: "bg-error-lighter", text: "text-error-dark" },
};

const TOP_STATS = [
  { key: "total", label: "Total Orders", icon: Package, bg: "bg-[#E0E7FF]", iconClass: "bg-secondary-lighter text-secondary-dark" },
  { key: "pendingPayment", label: "Pending Payment", icon: Clock, bg: "bg-[#FEF3C7]", iconClass: "bg-warning-lighter text-warning-dark" },
  { key: "processing", label: "Processing", icon: Truck, bg: "bg-[#CAF8E4]", iconClass: "bg-primary-lighter text-primary-dark" },
  { key: "shipped", label: "Shipped", icon: Truck, bg: "bg-[#FFE4E1]", iconClass: "bg-error-lighter text-error-dark" },
  { key: "delivered", label: "Delivered", icon: Package, bg: "bg-[#FCE7F3]", iconClass: "bg-secondary-lighter text-secondary-dark" },
  { key: "cancelled", label: "Cancelled", icon: Ban, bg: "bg-[#FED7AA]", iconClass: "bg-warning-lighter text-warning-dark" },
] as const;

export default function VendorOrders() {
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

  const counts = useMemo(() => {
    const c = {
      total: orders.length,
      pendingPayment: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    } as Record<string, number>;
    for (const o of orders) {
      if (o.paymentStatus === "pending") c.pendingPayment++;
      if (o.status === "processing" || o.status === "confirmed" || o.status === "packed") c.processing++;
      if (o.status === "delivering") c.shipped++;
      if (o.status === "delivered" || o.status === "completed") c.delivered++;
      if (o.status === "cancelled") c.cancelled++;
    }
    return c;
  }, [orders]);

  const profitData = useMemo(() => {
    const buckets: Record<string, { earning: number; profit: number }> = {};
    for (const o of orders) {
      const month = new Date(o.createdAt).toLocaleString("en", { month: "short" });
      if (!buckets[month]) buckets[month] = { earning: 0, profit: 0 };
      buckets[month].earning += o.vendorSubtotal;
      buckets[month].profit += o.vendorPayout;
    }
    const order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return order
      .filter((m) => buckets[m])
      .map((m) => ({ month: m, ...buckets[m] }));
  }, [orders]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-grey-900">Total Orders</h1>
        <p className="text-sm text-grey-500">All orders containing your products.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {TOP_STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className={`${s.bg} rounded-2xl p-4`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.iconClass} mb-2`}>
                <Icon size={16} />
              </div>
              <div className="text-xs font-medium text-grey-700">{s.label}</div>
              <div className="text-xl font-bold text-grey-900 mt-1">
                {loading ? <Skeleton className="h-6 w-12" /> : counts[s.key] ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-background rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-grey-900">Profit margin</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="earning"
                stroke="#088178"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#FFC107"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border p-5 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Platform cut</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-grey-500">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => {
                const itemsCount = o.vendorItems.reduce(
                  (s, it) => s + it.quantity,
                  0,
                );
                const pill = STATUS_PILLS[o.status] || STATUS_PILLS.pending;
                return (
                  <TableRow key={o._id}>
                    <TableCell className="text-xs text-grey-500">
                      #{o._id.slice(-5)}
                    </TableCell>
                    <TableCell className="text-grey-900">
                      {o.customer?.name || o.customer?.email || "—"}
                    </TableCell>
                    <TableCell>{itemsCount} pcs</TableCell>
                    <TableCell className="text-right font-medium text-primary-main">
                      {formatCurrency(o.vendorSubtotal)}
                    </TableCell>
                    <TableCell className="text-right text-grey-700">
                      {formatCurrency(o.platformCut)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${pill.bg} ${pill.text}`}
                      >
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-grey-600 text-sm">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <Link
                          to={`/vendor/orders/${o._id}`}
                          className="p-2 rounded-full hover:bg-muted text-grey-600 hover:text-grey-900"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
