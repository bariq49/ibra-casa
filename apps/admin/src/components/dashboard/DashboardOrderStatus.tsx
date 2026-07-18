import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderStatusProps {
  data?: {
    pending: number;
    confirmed: number;
    delivering: number;
    delivered: number;
    completed: number;
    cancelled: number;
    packed: number;
    paid: number;
  };
  loading?: boolean;
  isDemoMode?: boolean;
}

// Demo fallback data
const DEMO_DATA = {
  pending: 280,
  confirmed: 340,
  delivering: 210,
  delivered: 620,
  completed: 450,
  cancelled: 95,
  packed: 180,
  paid: 520,
};

export function DashboardOrderStatus({ data, loading, isDemoMode }: OrderStatusProps) {
  const source = isDemoMode ? DEMO_DATA : (data ?? DEMO_DATA);

  const chartData = [
    { name: "Completed", value: (source.completed || 0) + (source.paid || 0), color: "var(--color-success-main)" },
    { name: "Delivering", value: (source.delivering || 0) + (source.confirmed || 0) + (source.packed || 0), color: "var(--color-primary-main)" },
    { name: "Pending", value: source.pending || 0, color: "var(--color-warning-main)" },
    { name: "Cancelled", value: source.cancelled || 0, color: "var(--color-error-main)" },
  ];

  const totalOrders = chartData.reduce((s, d) => s + d.value, 0);

  if (loading) {
    return (
      <Card className="flex flex-col p-6 rounded-xl border border-grey-200 shadow-sm h-full">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="flex-1 min-h-[250px] flex items-center justify-center">
          <Skeleton className="w-40 h-40 rounded-full" />
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col p-6 rounded-xl border border-grey-200 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-sans font-semibold text-lg text-grey-900">Order Status</h3>
        {isDemoMode && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-warning-lighter text-warning-dark px-2 py-0.5 rounded-full">
            Demo
          </span>
        )}
      </div>

      <div className="flex-1 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid var(--color-grey-200)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{ color: "var(--color-grey-800)", fontWeight: 500 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center flex-col text-center pointer-events-none">
          <span className="text-3xl font-bold font-sans text-grey-900 leading-none">
            {totalOrders >= 1000 ? `${(totalOrders / 1000).toFixed(1)}K` : totalOrders.toLocaleString()}
          </span>
          <span className="text-sm text-grey-500 font-medium">Orders</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium text-grey-700">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-grey-900">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
