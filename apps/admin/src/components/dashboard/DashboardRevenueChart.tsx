import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyCompact } from "@/lib/utils";

interface MonthlyRevenuePoint {
  name: string;
  sales: number;
  orders: number;
}

interface DashboardRevenueChartProps {
  data?: MonthlyRevenuePoint[];
  loading?: boolean;
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
}

export function DashboardRevenueChart({
  data,
  loading,
  selectedYear,
  availableYears,
  onYearChange,
}: DashboardRevenueChartProps) {
  const chartData = data ?? [];

  const totalRevenue = chartData.reduce((s, d) => s + d.sales, 0);
  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);

  return (
    <Card className="flex flex-col p-6 rounded-xl border border-grey-200 shadow-sm h-full w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-sans font-semibold text-lg text-grey-900">Revenue</h3>
          <p className="text-sm text-grey-500 font-medium">Monthly Earning Status</p>
        </div>

        {/* Year selector */}
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          className="px-3 py-1.5 bg-grey-100 border-none rounded-full text-sm font-semibold text-grey-700 outline-hidden cursor-pointer"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Quick summary chips */}
      {!loading && (
        <div className="flex items-center gap-3 mb-4 mt-1">
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-lighter/50 text-primary-dark">
            {formatCurrencyCompact(totalRevenue)} total
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-grey-100 text-grey-700">
            {totalOrders.toLocaleString()} orders
          </div>
        </div>
      )}

      <div className="flex-1 w-full min-h-[260px]">
        {loading ? (
          <div className="flex items-end gap-2 h-full pt-4">
            {[40, 65, 45, 75, 55, 80, 60, 90, 70, 85, 95, 100].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-grey-500">
            No revenue data for this year.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-grey-200)"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--color-grey-500)" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--color-grey-500)" }}
                tickFormatter={formatCurrencyCompact}
              />
              <Tooltip
                cursor={{ fill: "var(--color-grey-100)" }}
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid var(--color-grey-200)",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "var(--color-grey-800)", fontWeight: 500 }}
                formatter={(value, name) => [
                  name === "sales" ? formatCurrencyCompact(Number(value)) : value,
                  name === "sales" ? "Revenue" : "Orders",
                ]}
              />
              <Bar
                dataKey="sales"
                fill="var(--color-primary-main)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
