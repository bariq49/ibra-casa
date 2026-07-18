import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  Store,
  Users as UsersIcon,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Eye,
  ExternalLink,
  Check,
  X,
  Pause,
  DollarSign,
  Mail,
  Phone,
  Package,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryWidget } from "@/components/dashboard/SummaryWidget";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn, formatCurrencyWhole } from "@/lib/utils";
import CreateVendorSheet from "@/components/vendor-config/CreateVendorSheet";

type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

interface VendorRow {
  _id: string;
  storeName: string;
  registrationNumber?: string;
  description?: string;
  logo?: string;
  status: VendorStatus;
  rejectionReason?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  userId?: { _id: string; name?: string; email?: string; role?: string };
  createdAt: string;
  updatedAt: string;
  // Enriched from analytics endpoint:
  revenue?: number;
  commission?: number;
  payout?: number;
  orders?: number;
}

interface VendorStatsResponse {
  vendor: {
    _id: string;
    storeName: string;
    status: VendorStatus;
    logo?: string;
    contactEmail: string;
    contactPhone?: string;
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
    createdAt: string;
  }>;
}

type StatusFilter = "all" | VendorStatus;

const PER_PAGE = 10;

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

export default function VendorsPage() {
  const { toast } = useToast();

  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  // Status counts for stat row.
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Drill-down details (admin-side per-vendor stats)
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [details, setDetails] = useState<VendorStatsResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Status change action
  const [statusAction, setStatusAction] = useState<{
    vendor: VendorRow;
    next: VendorStatus;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Create vendor sheet
  const [createOpen, setCreateOpen] = useState(false);

  // ─── Fetch ─────────────────────────────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [requestsRes, analyticsRes] = await Promise.all([
        adminApi.get(ADMIN_API_ENDPOINTS.VENDORS_REQUESTS),
        adminApi.get(ADMIN_API_ENDPOINTS.VENDOR_ADMIN_ANALYTICS),
      ]);

      const list: VendorRow[] = requestsRes?.data?.vendors ?? requestsRes?.data?.data ?? [];
      const analytics = analyticsRes?.data;
      const revenueByVendor = new Map<
        string,
        { revenue: number; commission: number; payout: number; orders: number }
      >();
      for (const v of analytics?.topVendors ?? []) {
        revenueByVendor.set(v._id?.toString?.() ?? v._id, {
          revenue: v.revenue ?? 0,
          commission: v.commission ?? 0,
          payout: v.payout ?? 0,
          orders: v.orders ?? 0,
        });
      }
      const enriched = list.map((v) => ({
        ...v,
        ...(revenueByVendor.get(v._id?.toString?.() ?? v._id) || {}),
      }));
      setVendors(enriched);

      setCounts({
        total: analytics?.statusCounts?.total ?? list.length,
        pending: analytics?.statusCounts?.pending ?? 0,
        approved: analytics?.statusCounts?.approved ?? 0,
        rejected: analytics?.statusCounts?.rejected ?? 0,
        suspended: analytics?.statusCounts?.suspended ?? 0,
      });
      setTotalRevenue(analytics?.revenue?.total ?? 0);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not load vendors",
        description: err?.response?.data?.message || "Try refreshing.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Drill-down ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!detailsId) {
      setDetails(null);
      return;
    }
    let active = true;
    setDetailsLoading(true);
    adminApi
      .get(ADMIN_API_ENDPOINTS.VENDOR_ADMIN_STATS_BY_ID(detailsId))
      .then(({ data }) => {
        if (active) setDetails(data);
      })
      .catch(() => {
        if (active) setDetails(null);
      })
      .finally(() => active && setDetailsLoading(false));
    return () => {
      active = false;
    };
  }, [detailsId]);

  // ─── Status change ─────────────────────────────────────────────────────
  async function applyStatusChange() {
    if (!statusAction) return;
    setStatusSubmitting(true);
    try {
      await adminApi.put(
        ADMIN_API_ENDPOINTS.VENDOR_BY_ID_STATUS(statusAction.vendor._id),
        {
          status: statusAction.next,
          rejectionReason:
            statusAction.next === "rejected" || statusAction.next === "suspended"
              ? reason
              : undefined,
        },
      );
      toast({
        title: `Vendor ${statusAction.next}`,
        description: `${statusAction.vendor.storeName} marked as ${statusAction.next}.`,
      });
      setStatusAction(null);
      setReason("");
      await load(true);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Status update failed",
        description: err?.response?.data?.message || "Try again.",
      });
    } finally {
      setStatusSubmitting(false);
    }
  }

  // ─── Filtering & pagination ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (!q) return true;
      return (
        v.storeName?.toLowerCase().includes(q) ||
        v.contactEmail?.toLowerCase().includes(q) ||
        v.userId?.email?.toLowerCase().includes(q) ||
        v.userId?.name?.toLowerCase().includes(q)
      );
    });
  }, [vendors, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * PER_PAGE, pageSafe * PER_PAGE);

  // Reset to page 1 if search/filter shrinks results
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1">
            Approve applications, monitor performance, and manage your sellers.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() => load(true)}
            className="rounded-full"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-primary-main hover:bg-primary-dark text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <SummaryWidget
          title="Total Vendors"
          value={loading ? "—" : counts.total.toLocaleString()}
          bgColor="bg-[rgba(160,226,224,0.5)]"
        />
        <SummaryWidget
          title="Pending"
          value={loading ? "—" : counts.pending.toLocaleString()}
          bgColor="bg-[rgba(255,235,105,0.6)]"
        />
        <SummaryWidget
          title="Approved"
          value={loading ? "—" : counts.approved.toLocaleString()}
          bgColor="bg-[rgba(158,232,114,0.55)]"
        />
        <SummaryWidget
          title="Suspended/Rejected"
          value={
            loading
              ? "—"
              : (counts.suspended + counts.rejected).toLocaleString()
          }
          bgColor="bg-[rgba(255,192,145,0.6)]"
        />
        <SummaryWidget
          title="Vendor Sales"
          value={loading ? "—" : formatCurrencyWhole(totalRevenue)}
          bgColor="bg-[rgba(146,189,245,0.55)]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search store, owner, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-muted/40"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[180px] rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground sm:ml-auto">
          {filtered.length} {filtered.length === 1 ? "vendor" : "vendors"}
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Store</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center h-24 text-muted-foreground"
                >
                  No vendors found.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((v) => (
                <TableRow key={v._id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      {v.logo ? (
                        <img
                          src={v.logo}
                          alt={v.storeName}
                          className="w-9 h-9 rounded-lg object-cover bg-muted"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-primary-lighter text-primary-dark flex items-center justify-center">
                          <Store size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-grey-900 truncate">
                          {v.storeName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {v.registrationNumber || "—"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-grey-900 truncate">
                        {v.userId?.name ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {v.userId?.email ?? "—"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="truncate">{v.contactEmail}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {v.contactPhone || "—"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-grey-700">
                    {(v.orders ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary-main">
                    {formatCurrencyWhole(v.revenue ?? 0)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 rounded-full text-xs"
                        title="Open this vendor's dashboard"
                      >
                        <Link to={`/dashboard/vendors/${v._id}`}>
                          <ExternalLink size={12} className="mr-1" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        title="Quick view"
                        onClick={() => setDetailsId(v._id)}
                      >
                        <Eye size={15} />
                      </Button>
                      {v.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-success-dark hover:bg-success-lighter"
                            title="Approve"
                            onClick={() =>
                              setStatusAction({ vendor: v, next: "approved" })
                            }
                          >
                            <Check size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-error-dark hover:bg-error-lighter"
                            title="Reject"
                            onClick={() =>
                              setStatusAction({ vendor: v, next: "rejected" })
                            }
                          >
                            <X size={15} />
                          </Button>
                        </>
                      )}
                      {v.status === "approved" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-warning-dark hover:bg-warning-lighter"
                          title="Suspend"
                          onClick={() =>
                            setStatusAction({ vendor: v, next: "suspended" })
                          }
                        >
                          <Pause size={15} />
                        </Button>
                      )}
                      {(v.status === "rejected" ||
                        v.status === "suspended") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-success-dark hover:bg-success-lighter"
                          title="Re-approve"
                          onClick={() =>
                            setStatusAction({ vendor: v, next: "approved" })
                          }
                        >
                          <Check size={15} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card rounded-lg border border-border/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Page <strong>{pageSafe}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Drill-down sheet */}
      <Sheet open={!!detailsId} onOpenChange={(o) => !o && setDetailsId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4 sm:p-6">
          <SheetHeader>
            <SheetTitle className="text-xl flex items-center gap-2">
              <Store size={18} />
              {details?.vendor.storeName ?? "Vendor details"}
            </SheetTitle>
            <SheetDescription>
              Full activity, performance, and contact info for this vendor.
            </SheetDescription>
          </SheetHeader>

          {detailsLoading || !details ? (
            <div className="space-y-3 mt-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div className="space-y-5 mt-6">
              <div className="flex items-center gap-3">
                {details.vendor.logo ? (
                  <img
                    src={details.vendor.logo}
                    alt={details.vendor.storeName}
                    className="w-14 h-14 rounded-xl object-cover bg-muted"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary-lighter text-primary-dark flex items-center justify-center">
                    <Store size={22} />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-grey-900">
                    {details.vendor.storeName}
                  </div>
                  <StatusBadge status={details.vendor.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatTile
                  icon={Package}
                  label="Products"
                  value={details.counts.products}
                />
                <StatTile
                  icon={Clock}
                  label="Pending"
                  value={details.counts.pendingProducts}
                />
                <StatTile
                  icon={UsersIcon}
                  label="Orders"
                  value={details.counts.orders}
                />
                <StatTile
                  icon={DollarSign}
                  label="Gross"
                  value={formatCurrencyWhole(details.counts.totalGross)}
                />
                <StatTile
                  icon={DollarSign}
                  label="Commission"
                  value={formatCurrencyWhole(details.counts.totalCommission)}
                />
                <StatTile
                  icon={DollarSign}
                  label="Vendor Payout"
                  value={formatCurrencyWhole(details.counts.totalRevenue)}
                />
              </div>

              <div className="border rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground" />
                  <span>{details.vendor.contactEmail}</span>
                </div>
                {details.vendor.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-muted-foreground" />
                    <span>{details.vendor.contactPhone}</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-grey-900 mb-2">
                  Recent orders
                </h3>
                {details.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No orders yet.
                  </p>
                ) : (
                  <div className="border rounded-xl overflow-hidden">
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
                        {details.recentOrders.map((o) => (
                          <TableRow key={o._id}>
                            <TableCell className="text-xs text-muted-foreground">
                              #{o._id.slice(-6).toUpperCase()}
                            </TableCell>
                            <TableCell>
                              {o.customer?.name ||
                                o.customer?.email ||
                                "Guest"}
                            </TableCell>
                            <TableCell className="text-right font-medium text-primary-main">
                              {formatCurrencyWhole(o.total)}
                            </TableCell>
                            <TableCell className="capitalize">
                              {o.status}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Status confirmation dialog */}
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
              {statusAction?.next} vendor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction
                ? `${statusAction.vendor.storeName} will be marked as ${statusAction.next}.`
                : ""}
              {(statusAction?.next === "rejected" ||
                statusAction?.next === "suspended") &&
                " Tell the vendor why — they'll see this on their portal."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(statusAction?.next === "rejected" ||
            statusAction?.next === "suspended") && (
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
                statusAction?.next === "approved" &&
                  "bg-success-main hover:bg-success-dark",
                statusAction?.next === "rejected" &&
                  "bg-error-main hover:bg-error-dark",
                statusAction?.next === "suspended" &&
                  "bg-warning-main hover:bg-warning-dark text-white",
              )}
            >
              {statusSubmitting ? "Saving…" : `Confirm ${statusAction?.next}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create vendor sheet */}
      <CreateVendorSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => load(true)}
      />
    </motion.div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon size={12} />
        <span>{label}</span>
      </div>
      <div className="text-lg font-bold text-grey-900 mt-1">{value}</div>
    </div>
  );
}
