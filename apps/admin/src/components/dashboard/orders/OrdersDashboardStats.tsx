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
}

export default function OrdersDashboardStats({ orders: _orders }: OrdersDashboardStatsProps) {
  const axiosPrivate = useAxiosPrivate();
  const [apiData, setApiData] = useState<any>(null);
  const { user } = useAuthStore();
  const isPreviewRole = user?.role === "preview";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosPrivate.get("/stats");
        setApiData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setApiData(null);
      }
    };
    fetchStats();
  }, [axiosPrivate]);

  const stats = useMemo(() => {
    if (!apiData) {
      return {
        total: 0,
        pendingPayment: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0,
        failed: 0,
      };
    }

    return {
      total: apiData.counts?.orders || 0,
      pendingPayment: apiData.orderStatus?.pending || 0,
      processing: (apiData.orderStatus?.confirmed || 0) + (apiData.orderStatus?.packed || 0),
      shipped: apiData.orderStatus?.delivering || 0,
      delivered: (apiData.orderStatus?.delivered || 0) + (apiData.orderStatus?.completed || 0),
      cancelled: apiData.orderStatus?.cancelled || 0,
      returned: apiData.counts?.refundRequests || 0,
      failed: apiData.counts?.paymentFailures || 0,
    };
  }, [apiData]);

  const activeChartData = useMemo(() => {
    if (!apiData?.monthlyRevenue) return [];
    return apiData.monthlyRevenue.map((m: any) => ({
      name: m.name,
      sales: m.sales,
      orders: m.orders,
    }));
  }, [apiData]);

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
            {activeChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No chart data available.
              </div>
            ) : (
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
                    tickFormatter={(val) => formatCurrencyCompact(val)}
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
                    dataKey="sales" 
                    name="Earnings"
                    stroke="#0EA5E9" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEarnings)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    name="Total Orders"
                    stroke="#22C55E" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProfits)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
