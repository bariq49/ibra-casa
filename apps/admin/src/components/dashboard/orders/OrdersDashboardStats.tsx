import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, RefreshCw, Truck, CheckCircle, XCircle, RotateCcw, AlertOctagon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { formatCurrencyCompact } from "@/lib/utils";

import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import useAuthStore from "@/store/useAuthStore";

interface OrdersDashboardStatsProps {
  orders: any[]; // Accept orders array to compute metrics if needed
  showDemoData?: boolean;
}

// Mock data for the profit margin chart
const chartData = [
  { name: "Jan", earnings: 4000, totalProfits: 2400 },
  { name: "Feb", earnings: 3000, totalProfits: 1398 },
  { name: "Mar", earnings: 2000, totalProfits: 9800 },
  { name: "Apr", earnings: 2780, totalProfits: 3908 },
  { name: "May", earnings: 1890, totalProfits: 4800 },
  { name: "Jun", earnings: 2390, totalProfits: 3800 },
  { name: "Jul", earnings: 3490, totalProfits: 4300 },
  { name: "Aug", earnings: 3100, totalProfits: 3500 },
  { name: "Sep", earnings: 3800, totalProfits: 3200 },
  { name: "Oct", earnings: 4500, totalProfits: 4100 },
  { name: "Nov", earnings: 4200, totalProfits: 4800 },
  { name: "Dec", earnings: 5100, totalProfits: 5300 },
];

export default function OrdersDashboardStats({ orders, showDemoData = false }: OrdersDashboardStatsProps) {
  const axiosPrivate = useAxiosPrivate();
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const isPreviewRole = user?.role === "preview";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axiosPrivate.get("/stats");
        setApiData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    if (!showDemoData) {
      fetchStats();
    }
  }, [axiosPrivate, showDemoData]);

  // Compute basic mock stats based on orders list mapping (in a real scenario, API would provide these aggregations).
  // For realism while keeping logic light, we process the available page orders.
  const mockStats = useMemo(() => {
    return {
      total: orders.length || 3823,
      pendingPayment: orders.filter((o) => o.paymentStatus === 'pending').length || 934,
      processing: orders.filter((o) => o.status === 'confirmed' || o.status === 'packed').length || 993,
      shipped: orders.filter((o) => o.status === 'delivering').length || 536,
      delivered: orders.filter((o) => o.status === 'delivered' || o.status === 'completed').length || 24392,
      cancelled: orders.filter((o) => o.status === 'cancelled').length || 9372,
      returned: 434, // Mock static for returned
      failed: orders.filter((o) => o.paymentStatus === 'failed').length || 938,
    };
  }, [orders]);

  const stats = useMemo(() => {
    if (showDemoData) return mockStats;
    if (!apiData) return {
      total: 0,
      pendingPayment: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      failed: 0,
    };
    
    return {
      total: apiData.counts?.orders || 0,
      pendingPayment: apiData.orderStatus?.pending || 0,
      processing: (apiData.orderStatus?.confirmed || 0) + (apiData.orderStatus?.packed || 0),
      shipped: apiData.orderStatus?.delivering || 0,
      delivered: (apiData.orderStatus?.delivered || 0) + (apiData.orderStatus?.completed || 0),
      cancelled: apiData.orderStatus?.cancelled || 0,
      returned: apiData.counts?.refundRequests || 0, // Using refund requests for 'returned' equivalent
      failed: apiData.counts?.paymentFailures || 0,
    };
  }, [apiData, showDemoData, mockStats]);

  const activeChartData = useMemo(() => {
    if (showDemoData) return chartData;
    if (!apiData?.monthlyRevenue) return [];
    // Map API monthlyRevenue `{name, sales, orders}` to fit existing chart layout `{name, earnings, totalProfits}`
    return apiData.monthlyRevenue.map((m: any) => ({
      name: m.name,
      earnings: m.sales,
      totalProfits: m.orders * 10,  // Scale orders for visual distinction if we want to fake "profits" for demo layout
      sales: m.sales,
      orders: m.orders
    }));
  }, [apiData, showDemoData]);

  const statCards = [
    {
      title: "Total Order",
      value: stats.total,
      icon: Package,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      iconBg: "bg-white",
    },
    {
      title: "Pending Payment",
      value: stats.pendingPayment,
      icon: Clock,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-500",
      iconBg: "bg-white",
    },
    {
      title: "Processing",
      value: stats.processing,
      icon: RefreshCw,
      bgColor: "bg-teal-50",
      iconColor: "text-teal-500",
      iconBg: "bg-white",
    },
    {
      title: "Shipped",
      value: stats.shipped,
      icon: Truck,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500",
      iconBg: "bg-white",
    },
    {
      title: "Delivered",
      value: stats.delivered,
      icon: CheckCircle,
      bgColor: "bg-pink-50",
      iconColor: "text-pink-500",
      iconBg: "bg-white",
    },
    {
      title: "Cancel",
      value: stats.cancelled,
      icon: XCircle,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      iconBg: "bg-white",
    },
    {
      title: "Returned",
      value: stats.returned,
      icon: RotateCcw,
      bgColor: "bg-lime-50",
      iconColor: "text-lime-600",
      iconBg: "bg-white",
    },
    {
      title: "Failed",
      value: stats.failed,
      icon: AlertOctagon,
      bgColor: "bg-sky-50",
      iconColor: "text-sky-500",
      iconBg: "bg-white",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Total Orders Context Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Total Orders</h2>
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-full px-6" disabled={isPreviewRole}>
          Export
        </Button>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className={`border-none shadow-sm ${stat.bgColor}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-full shadow-sm ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</span>
                <span className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profit Margin Chart Section */}
      <Card className="border-none shadow-sm mt-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Profit margin</h3>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <div className="flex bg-muted/50 p-1 border rounded-md">
                <Button variant="ghost" size="sm" className="h-7 text-xs bg-white shadow-sm font-medium">12 months</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">30 days</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">7 days</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">24 hours</Button>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                  tickFormatter={(val) => showDemoData ? `${val/1000}k` : formatCurrencyCompact(val)}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  iconType="circle" 
                  layout="horizontal" 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ paddingBottom: '20px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={showDemoData ? "earnings" : "sales"} 
                  name="Earnings"
                  stroke="#0EA5E9" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                />
                <Area 
                  type="monotone" 
                  dataKey={showDemoData ? "totalProfits" : "orders"} 
                  name={showDemoData ? "Total Profits" : "Total Orders"}
                  stroke="#22C55E" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorProfits)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
