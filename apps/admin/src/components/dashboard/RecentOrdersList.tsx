import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

// Data type
interface OrderData {
  _id: string;
  orderId: string;
  userId?: { name: string; email: string };
  total: number;
  status: string;
  createdAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-warning-lighter text-warning-dark border-warning-main/20";
    case "Processing":
      return "bg-info-lighter text-info-dark border-info-main/20";
    case "Delivered":
      return "bg-success-lighter text-success-dark border-success-main/20";
    case "Cancelled":
      return "bg-error-lighter text-error-dark border-error-main/20";
    default:
      return "bg-grey-200 text-grey-800 border-grey-300";
  }
};

export function RecentOrdersList() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosPrivate.get(
          "/stats/recent-orders?limit=10",
        );

        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch recent orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [axiosPrivate]);

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between py-5 border-b border-border/50">
        <CardTitle className="text-lg font-bold text-grey-900">
          Recent Orders
        </CardTitle>
        <Link to="/dashboard/orders">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-main hover:text-primary-dark hover:bg-primary-lighter text-xs font-semibold h-8 rounded-lg px-3"
          >
            View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full">
          {/* Desktop Table */}
          <table className="hidden lg:table w-full text-sm text-left">
            <thead className="text-xs text-grey-500 uppercase bg-grey-50/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded-full" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-grey-500"
                  >
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={`desktop-${order._id}`}
                    className="bg-white border-b border-border/50 hover:bg-grey-50/50 transition-colors last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-grey-900 whitespace-nowrap">
                      #
                      {order.orderId ||
                        order._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-grey-700">
                      {order.userId?.name || "Guest Customer"}
                    </td>
                    <td className="px-6 py-4 text-grey-500">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-grey-900">
                      {formatCurrency(
                        (order as any).total ||
                          (order as any).totalAmount ||
                          (order as any).amount ||
                          0,
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`font-medium px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)} capitalize`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/dashboard/orders?editOrder=${order._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-grey-500 hover:text-primary-main rounded-full"
                          title="Open in Orders — Edit Mode"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="lg:hidden flex flex-col divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={`mobile-skeleton-${i}`} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))
            ) : orders.length === 0 ? (
              <div className="px-4 py-8 text-center text-grey-500 text-sm">
                No recent orders found.
              </div>
            ) : (
              orders.map((order, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={`mobile-${order._id}`}
                  className="p-4 hover:bg-grey-50/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-grey-900 text-sm">
                        #
                        {order.orderId ||
                          order._id?.slice(-8).toUpperCase()}
                      </h4>
                      <p className="text-grey-500 text-xs mt-0.5">
                        {order.userId?.name || "Guest Customer"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`font-medium px-2 py-0.5 rounded-full border text-[10px] ${getStatusColor(order.status)} capitalize`}
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-end mt-3 pt-3 border-t border-border/40">
                    <div>
                      <p className="text-[10px] text-grey-400 font-medium mb-0.5 uppercase tracking-wider">
                        Amount
                      </p>
                      <p className="font-semibold text-grey-900 text-sm">
                        {formatCurrency(
                          (order as any).total ||
                            (order as any).totalAmount ||
                            (order as any).amount ||
                            0,
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-xs text-grey-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </p>
                      <Link to={`/dashboard/orders?editOrder=${order._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-grey-50 hover:bg-primary-lighter text-grey-500 hover:text-primary-main rounded-full shadow-sm border border-border/50"
                          title="Open Order"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
