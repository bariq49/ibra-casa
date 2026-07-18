import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Package,
  Clock,
  ShoppingCart,
  ExternalLink,
  Check,
  X,
  Pause,
  RefreshCw,
  ImageOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";
import { cn, formatCurrency, formatCurrencyWhole } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";

type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

interface VendorStats {
  vendor: {
    _id: string;
    storeName: string;
    registrationNumber?: string;
    description?: string;
    status: VendorStatus;
    rejectionReason?: string;
    logo?: string;
    contactEmail: string;
    contactPhone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    createdAt?: string;
  };
  counts: {
    products: number;
    pendingProducts: number;
    orders: number;
    totalGross: number;
    totalCommission: number;
    totalRevenue: number;
  };
  recentOrders: Array<{
    _id: string;
    customer: { name?: string; email?: string } | null;
    total: number;
    status: string;
    paymentStatus?: string;
    createdAt: string;
  }>;
  recentProducts: Array<{
    _id: string;
    name: string;
    image?: string;
    price: number;
    stock: number;
    approvalStatus?: "pending" | "approved" | "rejected";
    createdAt?: string;
  }>;
}

function StatusBadge({ status }: { status: VendorStatus }) {
  const map: Record<VendorStatus, { className: string; label: string }> = {
    approved: {
      className: "bg-success-lighter text-success-dark border-success-main/20",
      label: "Approved",
    },
    pending: {
      className: "bg-warning-lighter text-warning-dark border-warning-main/20",
      label: "Pending",
    },
    rejected: {
      className: "bg-error-lighter text-error-dark border-error-main/20",
      label: "Rejected",
    },
    suspended: {
      className: "bg-grey-200 text-grey-800 border-grey-300",
      label: "Suspended",
    },
  };
  const v = map[status];
  return (
    <Badge
      variant="outline"
      className={`font-medium px-2.5 py-0.5 rounded-full border ${v.className}`}
    >
      {v.label}
    </Badge>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  bg,
  iconClass,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  bg: string;
  iconClass: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-5 flex items-start justify-between`}>
      <div>
        <div className="text-sm font-medium text-grey-700">{label}</div>
        <div className="text-2xl font-bold text-grey-900 mt-1">{value}</div>
      </div>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
      >
        <Icon size={18} />
      </div>
    </div>
  );
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [data, setData] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [statusAction, setStatusAction] = useState<VendorStatus | null>(null);
  const [reason, setReason] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!id) return;
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await adminApi.get(
          ADMIN_API_ENDPOINTS.VENDOR_ADMIN_STATS_BY_ID(id),
        );
        setData(res.data);
      } catch (err: unknown) {
        toast({
          variant: "destructive",
          title: "Could not load vendor",
          description: getErrorMessage(err, "Try again."),
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, toast],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function applyStatusChange() {
    if (!data || !statusAction) return;
    setStatusSubmitting(true);
    try {
      await adminApi.put(
        ADMIN_API_ENDPOINTS.VENDOR_BY_ID_STATUS(data.vendor._id),
        {
          status: statusAction,
          rejectionReason:
            statusAction === "rejected" || statusAction === "suspended"
              ? reason
              : undefined,
        },
      );
      toast({
        title: `Vendor ${statusAction}`,
        description: `${data.vendor.storeName} marked as ${statusAction}.`,
      });
      setStatusAction(null);
      setReason("");
      await load(true);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Status update failed",
        description: getErrorMessage(err, "Try again."),
      });
    } finally {
      setStatusSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-background rounded-2xl border border-border p-10 text-center text-grey-500">
        Vendor not found.
        <div className="mt-4">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/dashboard/vendors">Back to Vendors</Link>
          </Button>
        </div>
      </div>
    );
  }

  const v = data.vendor;
  const fullAddress = v.address
    ? [
        v.address.street,
        v.address.city,
        v.address.state,
        v.address.country,
        v.address.postalCode,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const statusBoxBg = {
    pending: "bg-warning-lighter/40 border-warning-main/30",
    approved: "bg-success-lighter/40 border-success-main/30",
    rejected: "bg-error-lighter/40 border-error-main/30",
    suspended: "bg-grey-100 border-grey-300",
  }[v.status];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => navigate("/dashboard/vendors")}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-grey-900">
              {v.storeName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Vendor dashboard view
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(true)}
            disabled={refreshing}
            className="rounded-full"
          >
            <RefreshCw
              size={14}
              className={cn("mr-1.5", refreshing && "animate-spin")}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full"
          >
            <Link to={`/dashboard/vendor-products?vendor=${v._id}`}>
              <Package size={14} className="mr-1.5" />
              Open products
            </Link>
          </Button>
          {v.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => setStatusAction("approved")}
                className="rounded-full bg-success-main hover:bg-success-dark text-white"
              >
                <Check size={14} className="mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setStatusAction("rejected")}
                className="rounded-full"
              >
                <X size={14} className="mr-1" /> Reject
              </Button>
            </>
          )}
          {v.status === "approved" && (
            <Button
              size="sm"
              onClick={() => setStatusAction("suspended")}
              className="rounded-full bg-warning-main hover:bg-warning-dark text-white"
            >
              <Pause size={14} className="mr-1" /> Suspend
            </Button>
          )}
          {(v.status === "rejected" || v.status === "suspended") && (
            <Button
              size="sm"
              onClick={() => setStatusAction("approved")}
              className="rounded-full bg-success-main hover:bg-success-dark text-white"
            >
              <Check size={14} className="mr-1" /> Re-approve
            </Button>
          )}
        </div>
      </div>

      {/* Vendor profile card */}
      <Card className={cn("border", statusBoxBg)}>
        <CardContent className="p-5 md:p-6 flex flex-col md:flex-row gap-5">
          <div className="flex items-center gap-4">
            {v.logo ? (
              <img
                src={v.logo}
                alt={v.storeName}
                className="w-16 h-16 rounded-2xl object-cover bg-muted"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary-lighter text-primary-dark flex items-center justify-center">
                <Store size={26} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-grey-900 text-lg">
                  {v.storeName}
                </h2>
                <StatusBadge status={v.status} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {v.registrationNumber
                  ? `Reg: ${v.registrationNumber}`
                  : "No registration number"}
                {v.createdAt
                  ? ` · Joined ${new Date(v.createdAt).toLocaleDateString()}`
                  : ""}
              </div>
              {v.description && (
                <p className="text-sm text-grey-700 mt-2 max-w-2xl">
                  {v.description}
                </p>
              )}
            </div>
          </div>

          <div className="md:ml-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-grey-700">
              <Mail size={14} className="text-muted-foreground shrink-0" />
              <span className="truncate">{v.contactEmail}</span>
            </div>
            {v.contactPhone && (
              <div className="flex items-center gap-2 text-grey-700">
                <Phone size={14} className="text-muted-foreground shrink-0" />
                <span className="truncate">{v.contactPhone}</span>
              </div>
            )}
            {fullAddress && (
              <div className="flex items-center gap-2 text-grey-700 sm:col-span-2">
                <MapPin
                  size={14}
                  className="text-muted-foreground shrink-0"
                />
                <span className="truncate">{fullAddress}</span>
              </div>
            )}
          </div>
        </CardContent>
        {(v.status === "rejected" || v.status === "suspended") &&
          v.rejectionReason && (
            <CardContent className="px-5 md:px-6 pb-5 -mt-2 text-sm text-error-dark">
              <strong>Reason:</strong> {v.rejectionReason}
            </CardContent>
          )}
      </Card>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatTile
          label="Products"
          value={data.counts.products.toLocaleString()}
          icon={Package}
          bg="bg-[#D1FADF]"
          iconClass="bg-success-lighter text-success-dark"
        />
        <StatTile
          label="Pending Products"
          value={data.counts.pendingProducts.toLocaleString()}
          icon={Clock}
          bg="bg-[#FFF3CD]"
          iconClass="bg-warning-lighter text-warning-dark"
        />
        <StatTile
          label="Orders"
          value={data.counts.orders.toLocaleString()}
          icon={ShoppingCart}
          bg="bg-[#E0E7FF]"
          iconClass="bg-secondary-lighter text-secondary-dark"
        />
        <StatTile
          label="Gross Sales"
          value={formatCurrencyWhole(data.counts.totalGross)}
          icon={DollarSign}
          bg="bg-[rgba(146,189,245,0.55)]"
          iconClass="bg-info-lighter text-info-dark"
        />
        <StatTile
          label="Platform Commission"
          value={formatCurrencyWhole(data.counts.totalCommission)}
          icon={DollarSign}
          bg="bg-[rgba(255,235,105,0.6)]"
          iconClass="bg-warning-lighter text-warning-dark"
        />
        <StatTile
          label="Vendor Payout"
          value={formatCurrencyWhole(data.counts.totalRevenue)}
          icon={DollarSign}
          bg="bg-[rgba(160,226,224,0.6)]"
          iconClass="bg-primary-lighter text-primary-dark"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50">
            <CardTitle className="text-base font-bold text-grey-900">
              Recent Orders
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs h-8 rounded-lg text-primary-main"
            >
              <Link to={`/dashboard/orders?vendor=${v._id}`}>
                View all <ExternalLink size={12} className="ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No orders yet for this vendor.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((o) => (
                    <TableRow key={o._id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        #{o._id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="text-grey-900 truncate">
                          {o.customer?.name ?? "Guest"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {o.customer?.email ?? ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary-main">
                        {formatCurrencyWhole(o.total)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs capitalize text-grey-700">
                          {o.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent products */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50">
            <CardTitle className="text-base font-bold text-grey-900">
              Recent Products
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs h-8 rounded-lg text-primary-main"
              >
                <Link to={`/dashboard/vendor-products?vendor=${v._id}`}>
                  Manage <ExternalLink size={12} className="ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentProducts.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                This vendor has no products yet.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentProducts.map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30"
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-md object-cover bg-muted shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-grey-400 shrink-0">
                        <ImageOff size={16} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-grey-900 truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Stock: {p.stock} ·{" "}
                        <span className="capitalize">
                          {p.approvalStatus ?? "approved"}
                        </span>
                      </div>
                    </div>
                    <div className="font-medium text-primary-main">
                      {formatCurrency(p.price)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status change confirmation */}
      <AlertDialog
        open={!!statusAction}
        onOpenChange={(o) => {
          if (!o) {
            setStatusAction(null);
            setReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="capitalize">
              {statusAction} vendor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction
                ? `${data.vendor.storeName} will be marked as ${statusAction}.`
                : ""}
              {(statusAction === "rejected" || statusAction === "suspended") &&
                " Tell the vendor why — they'll see this on their portal."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(statusAction === "rejected" || statusAction === "suspended") && (
            <Textarea
              placeholder="Reason (visible to vendor)…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={applyStatusChange}
              disabled={statusSubmitting}
              className={cn(
                statusAction === "approved" &&
                  "bg-success-main hover:bg-success-dark",
                statusAction === "rejected" &&
                  "bg-error-main hover:bg-error-dark",
                statusAction === "suspended" &&
                  "bg-warning-main hover:bg-warning-dark text-white",
              )}
            >
              {statusSubmitting ? "Saving…" : `Confirm ${statusAction}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
