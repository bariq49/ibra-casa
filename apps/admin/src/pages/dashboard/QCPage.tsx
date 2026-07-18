import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  Package
} from "lucide-react";

interface OrderItem {
  productId?: string;
  name?: string;
  price: number;
  quantity: number;
  image?: string;
  product?: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  qcStatus: string;
  createdAt: string;
}

export default function QCPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/orders/qc/pending");
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch QC orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pending QC orders",
      });
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axiosPrivate.get("/orders/qc/pending");
      setOrders(response.data.orders || []);
      toast({
        title: "Success",
        description: "QC orders refreshed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh QC orders",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmQC = async (orderId: string) => {
    setIsConfirming(true);
    try {
      await axiosPrivate.post(`/orders/${orderId}/qc`);
      toast({
        title: "Success",
        description: "Items restocked successfully",
      });
      setOrders(orders.filter(o => o._id !== orderId));
      setIsViewOpen(false);
    } catch (error) {
      console.error("Error confirming QC:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm restock",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-dark">
            Quality Control
          </h1>
          <p className="text-sm text-grey-500 mt-1">
            Manage cancelled orders and restock inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-[80px]"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-grey-500/10 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-grey-500/5 hover:bg-grey-500/5 cursor-default">
                <TableHead className="w-[120px] font-semibold text-primary-dark whitespace-nowrap">
                  Order ID
                </TableHead>
                <TableHead className="font-semibold text-primary-dark whitespace-nowrap">
                  Customer
                </TableHead>
                <TableHead className="font-semibold text-primary-dark whitespace-nowrap">
                  Items
                </TableHead>
                <TableHead className="font-semibold text-primary-dark whitespace-nowrap">
                  Total
                </TableHead>
                <TableHead className="font-semibold text-primary-dark whitespace-nowrap">
                  QC Status
                </TableHead>
                <TableHead className="text-right font-semibold text-primary-dark whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-grey-500">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-success-main mb-2 opacity-20" />
                      <p>No pending QC orders found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-grey-500/5 border-b transition-colors"
                    >
                      <TableCell className="font-medium text-[14px]">
                        {order.orderId}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-primary-dark text-[14px] truncate max-w-[200px]">
                            {order.user?.name}
                          </span>
                          <span className="text-xs text-grey-500 truncate max-w-[200px]">
                            {order.user?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.items?.length || 0} items
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-warning-light/10 text-warning-main border-warning-light/20">
                          {order.qcStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Details & Restock"
                            className="h-8 w-8 rounded-full hover:bg-primary-dark/10 hover:text-primary-dark transition-colors"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsViewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* QC Detail Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl">Quality Control Check</DialogTitle>
            <DialogDescription>
              Review the cancelled items below and confirm restock to restore inventory.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-grey-500">Order ID</p>
                  <p className="font-medium">{selectedOrder.orderId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-grey-500">Customer</p>
                  <p className="font-medium">{selectedOrder.user?.name}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-primary-dark">Items to Restock:</h4>
                <div className="rounded-lg border bg-white divide-y max-h-[250px] overflow-y-auto">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.image || item.product?.image ? (
                          <div className="h-10 w-10 shrink-0 rounded-md bg-grey-500/10 overflow-hidden border">
                            <img 
                              src={item.image || item.product?.image || ""} 
                              alt="product" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-md bg-grey-500/10 flex items-center justify-center border">
                            <Package className="h-5 w-5 text-grey-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.name || item.product?.name}
                          </p>
                          <p className="text-xs text-grey-500">
                            Qty: <span className="font-medium text-primary-dark">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-warning-light/10 text-warning-main p-3 rounded-lg flex items-start gap-2 text-sm border border-warning-light/20">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>Clicking "Confirm Restock" will add the quantities back to the inventory for all listed items.</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsViewOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedOrder && handleConfirmQC(selectedOrder._id)}
              disabled={isConfirming}
              className="bg-primary-dark hover:bg-primary-darker"
            >
              {isConfirming ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Restocking...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Restock
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
