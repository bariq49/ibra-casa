import VendorAnalytics from "@/components/vendor-config/VendorAnalytics";

export default function VendorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendor Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Platform-wide vendor performance, revenue, and approval funnel.
        </p>
      </div>
      <VendorAnalytics />
    </div>
  );
}
