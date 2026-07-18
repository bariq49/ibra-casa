import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Store,
  ArrowRight,
  Clock,
  CheckCircle2,
  DollarSign,
  Settings,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";
import { formatCurrencyWhole } from "@/lib/utils";

interface VendorAnalytics {
  statusCounts: {
    total: number;
    pending: number;
    approved: number;
    suspended: number;
    rejected: number;
  };
  revenue: { total: number };
}

export function VendorManagementCard() {
  const [data, setData] = useState<VendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminApi
      .get(`${ADMIN_API_ENDPOINTS.VENDOR_ADMIN_ANALYTICS}?topN=1`)
      .then((res) => active && setData(res.data))
      .catch(() => active && setData(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Headline strip */}
          <div className="lg:col-span-2 p-6 bg-linear-to-br from-primary-darker via-primary-dark to-primary-main text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Store size={22} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider font-bold opacity-80">
                  Marketplace
                </div>
                <h3 className="text-xl font-bold">Vendor Management</h3>
              </div>
            </div>
            <p className="text-sm opacity-90">
              Approve applications, drill into any vendor's dashboard, and
              monitor platform-wide performance.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                asChild
                className="rounded-full bg-white text-primary-darker hover:bg-white/90 font-semibold"
              >
                <Link to="/dashboard/vendors">
                  Open vendors <ArrowRight size={14} className="ml-1" />
                </Link>
              </Button>
              <Button
                size="sm"
                asChild
                variant="outline"
                className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              >
                <Link to="/dashboard/vendor-products">Vendor products</Link>
              </Button>
            </div>
          </div>

          {/* Stats + actions */}
          <div className="lg:col-span-3 p-6 bg-background">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Stat
                icon={Clock}
                label="Pending"
                value={
                  loading ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    data?.statusCounts.pending ?? 0
                  )
                }
                tone="warning"
              />
              <Stat
                icon={CheckCircle2}
                label="Approved"
                value={
                  loading ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    data?.statusCounts.approved ?? 0
                  )
                }
                tone="success"
              />
              <Stat
                icon={DollarSign}
                label="Vendor Sales"
                value={
                  loading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    formatCurrencyWhole(data?.revenue.total ?? 0)
                  )
                }
                tone="info"
              />
            </div>

            <div className="border-t border-border pt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                asChild
                className="rounded-full"
              >
                <Link to="/dashboard/vendors">
                  <Store size={14} className="mr-1.5" /> All vendors
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
                className="rounded-full"
              >
                <Link to="/dashboard/vendor-analytics">
                  <BarChart3 size={14} className="mr-1.5" /> Analytics
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
                className="rounded-full"
              >
                <Link to="/dashboard/vendor-config">
                  <Settings size={14} className="mr-1.5" /> Configuration
                </Link>
              </Button>
              {data && data.statusCounts.pending > 0 && (
                <Button
                  size="sm"
                  asChild
                  className="rounded-full bg-warning-main hover:bg-warning-dark text-white ml-auto"
                >
                  <Link to="/dashboard/vendors?status=pending">
                    Review {data.statusCounts.pending} pending
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
  tone: "success" | "warning" | "info";
}) {
  const toneClass = {
    success: "bg-success-lighter text-success-dark",
    warning: "bg-warning-lighter text-warning-dark",
    info: "bg-info-lighter text-info-dark",
  }[tone];
  return (
    <div className="bg-muted/40 rounded-xl p-3">
      <div className="flex items-center gap-2 text-xs text-grey-600">
        <span
          className={`w-6 h-6 rounded-md flex items-center justify-center ${toneClass}`}
        >
          <Icon size={12} />
        </span>
        <span>{label}</span>
      </div>
      <div className="text-xl font-bold text-grey-900 mt-1">{value}</div>
    </div>
  );
}
