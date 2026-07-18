import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, ShoppingCart, DollarSign, Repeat, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { usePreviewGuard } from "@/hooks/usePreviewGuard";
import {
  previewReports,
  previewProductsSummary,
  previewProducts,
} from "@/lib/preview/vendorPreviewData";
import { formatCurrencyCompact, formatCurrencyWhole } from "@/lib/utils";

type RangeKey = "ytd" | "6m" | "3m";

const RANGE_LABEL: Record<RangeKey, string> = {
  ytd: "Year to date",
  "6m": "Last 6 months",
  "3m": "Last 3 months",
};

const PIE_COLORS = ["#088178", "#FFC107", "#6366F1", "#EC4899", "#10B981", "#F97316"];

export default function VendorReports() {
  const [range, setRange] = useState<RangeKey>("ytd");
  const { toast } = useToast();
  const { blockIfPreview } = usePreviewGuard();

  const rows = useMemo(() => {
    if (range === "3m") return previewReports.slice(-3);
    if (range === "6m") return previewReports.slice(-6);
    return previewReports;
  }, [range]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        orders: acc.orders + r.orders,
        gross: acc.gross + r.grossSales,
        refunds: acc.refunds + r.refunds,
        net: acc.net + r.netSales,
        payout: acc.payout + r.payout,
      }),
      { orders: 0, gross: 0, refunds: 0, net: 0, payout: 0 },
    );
  }, [rows]);

  const productSplit = useMemo(() => {
    // Distribute the period payout proportionally across the demo catalog
    // so the pie chart looks plausible without hitting the API.
    const total = previewProducts.reduce((s, p) => s + p.price * (p.stock + 5), 0);
    return previewProducts.slice(0, 6).map((p) => {
      const weight = (p.price * (p.stock + 5)) / Math.max(1, total);
      return {
        name: p.name,
        value: Math.round(totals.payout * weight),
      };
    });
  }, [totals.payout]);

  function handleExport() {
    if (blockIfPreview("export reports")) return;
    toast({ title: "Export started", description: "Your report will arrive by email." });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-grey-900">Sales Reports</h1>
          <p className="text-sm text-grey-500 mt-1">
            Revenue, refunds, and payout totals for {RANGE_LABEL[range].toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center bg-muted/40 rounded-full p-1 border border-border">
            {(Object.keys(RANGE_LABEL) as RangeKey[]).map((r) => {
              const isActive = r === range;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`px-3.5 h-8 text-xs font-semibold rounded-full transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-grey-700 hover:text-grey-900"
                  }`}
                >
                  {RANGE_LABEL[r]}
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            className="rounded-full"
          >
            <Download size={14} className="mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile
          icon={ShoppingCart}
          label="Orders"
          value={totals.orders.toLocaleString()}
          bg="bg-[#E0E7FF]"
          iconClass="bg-secondary-lighter text-secondary-dark"
        />
        <KpiTile
          icon={DollarSign}
          label="Gross Sales"
          value={formatCurrencyWhole(totals.gross)}
          bg="bg-[#CAF8E4]"
          iconClass="bg-primary-lighter text-primary-dark"
        />
        <KpiTile
          icon={Repeat}
          label="Refunds"
          value={formatCurrencyWhole(totals.refunds)}
          bg="bg-[#FFE4E1]"
          iconClass="bg-error-lighter text-error-dark"
        />
        <KpiTile
          icon={Wallet}
          label="Net Payout"
          value={formatCurrencyWhole(totals.payout)}
          bg="bg-[#FEF3C7]"
          iconClass="bg-warning-lighter text-warning-dark"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-background rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-grey-900 mb-4">Revenue vs Payout</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrencyCompact(v)} />
                <Tooltip formatter={(value) => formatCurrencyWhole(Number(value))} />
                <Legend />
                <Bar dataKey="grossSales" name="Gross sales" fill="#088178" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line
                  type="monotone"
                  dataKey="payout"
                  name="Net payout"
                  stroke="#FFC107"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-grey-900 mb-4">
            Revenue by Product
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {productSplit.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrencyWhole(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {productSplit.map((p, i) => (
              <li key={p.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-grey-700">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="truncate max-w-[140px]">{p.name}</span>
                </span>
                <span className="font-medium text-grey-900">
                  {formatCurrencyWhole(p.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border p-5 overflow-x-auto">
        <h3 className="font-semibold text-grey-900 mb-3">Monthly breakdown</h3>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Gross sales</TableHead>
              <TableHead className="text-right">Refunds</TableHead>
              <TableHead className="text-right">Net sales</TableHead>
              <TableHead className="text-right">Payout</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.month}>
                <TableCell className="font-medium text-grey-900">
                  {r.month}
                </TableCell>
                <TableCell className="text-right">{r.orders}</TableCell>
                <TableCell className="text-right text-primary-main font-medium">
                  {formatCurrencyWhole(r.grossSales)}
                </TableCell>
                <TableCell className="text-right text-error-main">
                  −{formatCurrencyWhole(r.refunds)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrencyWhole(r.netSales)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrencyWhole(r.payout)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-grey-400 mt-3">
          Lifetime gross: {formatCurrencyWhole(previewProductsSummary.totalGrossRevenue)}{" "}
          · Lifetime payout:{" "}
          {formatCurrencyWhole(previewProductsSummary.totalPayout)}
        </p>
      </div>
    </div>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  bg,
  iconClass,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  bg: string;
  iconClass: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-5`}>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass} mb-3`}
      >
        <Icon size={18} />
      </div>
      <div className="text-sm font-medium text-grey-700">{label}</div>
      <div className="text-2xl font-bold text-grey-900 mt-1">{value}</div>
    </div>
  );
}
