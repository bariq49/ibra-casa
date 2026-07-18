import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type ShippingAddress = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

type VendorOrder = {
  _id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customer?: { name?: string; email?: string };
  shippingAddress?: ShippingAddress;
  vendorItems: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
    commissionRate?: number;
  }>;
  vendorSubtotal: number;
  platformCut: number;
  vendorPayout: number;
};

export default function VendorOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    adminApi
      .get(ADMIN_API_ENDPOINTS.VENDOR_ORDER_BY_ID(id))
      .then(({ data }) => active && setOrder(data?.order ?? null))
      .catch(() => active && setOrder(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }
  if (!order) {
    return (
      <div className="bg-background rounded-2xl border border-border p-10 text-center text-grey-500">
        Order not found.
      </div>
    );
  }

  const ship = order.shippingAddress;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/vendor/orders"
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-grey-700"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-grey-900">
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-sm text-grey-500">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-background rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-grey-900 mb-3">Customer</h3>
          <div className="text-sm space-y-1">
            <div className="text-grey-900">{order.customer?.name ?? "—"}</div>
            <div className="text-grey-500">{order.customer?.email ?? "—"}</div>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-grey-900 mb-3">Shipping Address</h3>
          {ship ? (
            <div className="text-sm text-grey-700 space-y-0.5">
              <div>
                {ship.firstName} {ship.lastName}
              </div>
              <div>{ship.phoneNumber}</div>
              <div>
                {ship.street}, {ship.city}
              </div>
              <div>
                {ship.state}, {ship.country} {ship.postalCode}
              </div>
            </div>
          ) : (
            <div className="text-sm text-grey-500">—</div>
          )}
        </div>

        <div className="bg-background rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-grey-900 mb-3">Status</h3>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-grey-500">Order: </span>
              <span className="font-medium text-grey-900 capitalize">
                {order.status}
              </span>
            </div>
            <div>
              <span className="text-grey-500">Payment: </span>
              <span className="font-medium text-grey-900 capitalize">
                {order.paymentStatus}
              </span>
            </div>
            <div>
              <span className="text-grey-500">Method: </span>
              <span className="font-medium text-grey-900 uppercase">
                {order.paymentMethod}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border p-5">
        <h3 className="font-semibold text-grey-900 mb-3">Your Items in This Order</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Commission %</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.vendorItems.map((it, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-grey-900">
                    {it.name}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(it.price)}</TableCell>
                  <TableCell className="text-right">{it.quantity}</TableCell>
                  <TableCell className="text-right">
                    {it.commissionRate ?? 0}%
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary-main">
                    {formatCurrency(it.price * it.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 ml-auto max-w-sm space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-grey-500">Subtotal</span>
            <span className="font-medium">{formatCurrency(order.vendorSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-grey-500">Platform cut</span>
            <span className="font-medium text-error-dark">
              − {formatCurrency(order.platformCut)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="text-grey-700 font-semibold">Your payout</span>
            <span className="font-bold text-primary-main text-lg">
              {formatCurrency(order.vendorPayout)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
