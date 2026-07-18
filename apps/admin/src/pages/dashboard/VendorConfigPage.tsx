import VendorConfiguration from "@/components/vendor-config/VendorConfiguration";

const VendorConfigPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Vendor Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          System-wide rules that govern vendor onboarding and commission. Vendor
          listings live on the <strong>Vendors</strong> page; performance
          breakdowns live on <strong>Vendor Analytics</strong>.
        </p>
      </div>
      <VendorConfiguration />
    </div>
  );
};

export default VendorConfigPage;
