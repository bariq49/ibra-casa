import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import { Link } from "react-router";
import { useStoreSettingsStore } from "@/store/useStoreSettingsStore";
import { useTheme } from "@/components/theme-provider";
import useAuthStore from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Globe,
  Share2,
  ImageIcon,
  User,
  ChevronRight,
  CreditCard,
  Truck,
  Store,
  Phone,
  Layout,
  Code2,
  Activity,
  Building2,
  Mail,
  Save,
  Loader2,
  Banknote,
  Landmark,
  Wallet,
  Moon,
  Sun,
  Monitor,
  Sparkles,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_NEXT_PUBLIC_API_URL || "http://localhost:8000";

type StoreConfig = {
  enableStripe: boolean;
  enableCod: boolean;
  enableBankTransfer: boolean;
  enablePaypal: boolean;
  taxRate: number;
  shippingCost: number;
  freeDeliveryThreshold: number;
  currency: string;
  storeName: string;
  supportEmail: string;
  apiLogLevel?: string;
};

const defaultConfig: StoreConfig = {
  enableStripe: true,
  enableCod: true,
  enableBankTransfer: false,
  enablePaypal: false,
  taxRate: 0,
  shippingCost: 0,
  freeDeliveryThreshold: 999,
  currency: "USD",
  storeName: "Sellzy",
  supportEmail: "",
};

const configLinks = [
  {
    title: "Website Config",
    description: "Homepage blocks & branding",
    href: "/dashboard/website-config",
    icon: Globe,
  },
  {
    title: "Social Media",
    description: "Storefront social links",
    href: "/dashboard/social-media",
    icon: Share2,
  },
  {
    title: "Website Icons",
    description: "Favicon and app icons",
    href: "/dashboard/website-icons",
    icon: ImageIcon,
  },
  {
    title: "Contact Settings",
    description: "Contact page & map",
    href: "/dashboard/contact-settings",
    icon: Phone,
  },
  {
    title: "Vendor Config",
    description: "Commission & onboarding",
    href: "/dashboard/vendor-config",
    icon: Building2,
  },
  {
    title: "Component Types",
    description: "Page component schemas",
    href: "/dashboard/component-types",
    icon: Layout,
  },
  {
    title: "System Metrics",
    description: "API logs & monitoring",
    href: "/dashboard/api-config/system-metrics",
    icon: Activity,
  },
  {
    title: "Endpoint Tester",
    description: "Test API endpoints",
    href: "/dashboard/api-config/endpoint-test",
    icon: Code2,
  },
  {
    title: "My Profile",
    description: "Account & password",
    href: "/dashboard/profile",
    icon: User,
  },
];

type PaymentRowProps = {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  badge?: string;
  badgeVariant?: "live" | "soon";
};

function PaymentRow({
  icon,
  iconClassName,
  title,
  description,
  checked,
  onCheckedChange,
  badge,
  badgeVariant = "live",
}: PaymentRowProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-grey-300",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-grey-900">{title}</p>
          {badge && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                badgeVariant === "live"
                  ? "bg-success-lighter text-success-dark"
                  : "bg-warning-lighter text-warning-dark",
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-grey-500 leading-relaxed">
          {description}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function FieldShell({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-grey-700">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-grey-500 leading-snug">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { token } = useAuthStore();
  const { toast } = useToast();

  const [config, setConfig] = useState<StoreConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activePayments = useMemo(() => {
    let n = 0;
    if (config.enableStripe) n += 1;
    if (config.enableCod) n += 1;
    if (config.enableBankTransfer) n += 1;
    if (config.enablePaypal) n += 1;
    return n;
  }, [config]);

  const taxPercent = Math.round(config.taxRate * 1000) / 10;

  const fetchConfig = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/system-metrics/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const c = data.config || {};
      setConfig({
        enableStripe: c.enableStripe ?? true,
        enableCod: c.enableCod ?? true,
        enableBankTransfer: c.enableBankTransfer ?? false,
        enablePaypal: c.enablePaypal ?? false,
        taxRate: typeof c.taxRate === "number" ? c.taxRate : 0,
        shippingCost: typeof c.shippingCost === "number" ? c.shippingCost : 0,
        freeDeliveryThreshold:
          typeof c.freeDeliveryThreshold === "number"
            ? c.freeDeliveryThreshold
            : 999,
        currency: c.currency || "USD",
        storeName: c.storeName || "Sellzy",
        supportEmail: c.supportEmail || "",
        apiLogLevel: c.apiLogLevel,
      });
      useStoreSettingsStore.getState().setCurrency(c.currency || "USD");
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast({
        variant: "destructive",
        title: "Failed to load settings",
        description:
          axiosError.response?.data?.message || "Could not load store settings",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateField = <K extends keyof StoreConfig>(
    key: K,
    value: StoreConfig[K],
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!token) return;
    if (!config.enableStripe && !config.enableCod) {
      toast({
        variant: "destructive",
        title: "Invalid payment methods",
        description: "Enable at least Stripe or Cash on Delivery.",
      });
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/api/system-metrics/config`,
        {
          enableStripe: config.enableStripe,
          enableCod: config.enableCod,
          enableBankTransfer: config.enableBankTransfer,
          enablePaypal: config.enablePaypal,
          taxRate: config.taxRate,
          shippingCost: config.shippingCost,
          freeDeliveryThreshold: config.freeDeliveryThreshold,
          currency: config.currency,
          storeName: config.storeName,
          supportEmail: config.supportEmail,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast({
        title: "Settings saved",
        description: "Store and payment settings were updated.",
      });
      useStoreSettingsStore.getState().setCurrency(config.currency);
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast({
        variant: "destructive",
        title: "Save failed",
        description:
          axiosError.response?.data?.message || "Could not save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full animate-in fade-in duration-300 pb-4">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-lighter/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-darker">
            <Sparkles className="h-3.5 w-3.5" />
            System config
          </div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-grey-900 sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-main text-white shadow-sm">
              <Settings className="h-5 w-5" />
            </span>
            Settings
          </h1>
          <p className="max-w-xl text-sm text-grey-500">
            Control checkout payments, tax, shipping, and store identity from one
            place.
          </p>
        </div>

        {!loading && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-full bg-white border border-border px-3 py-1 text-xs font-medium text-grey-700 shadow-xs"
            >
              {activePayments} payment
              {activePayments === 1 ? "" : "s"} enabled
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-white border border-border px-3 py-1 text-xs font-medium text-grey-700 shadow-xs"
            >
              Tax {taxPercent}% · {config.currency}
            </Badge>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-12">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-64 animate-pulse rounded-2xl border border-border bg-muted/50",
                i === 0 ? "lg:col-span-7" : i === 1 ? "lg:col-span-5" : "lg:col-span-6",
              )}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Payments — wide */}
          <Card className="h-fit overflow-hidden border-border/80 shadow-sm lg:col-span-7">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary-lighter/50 to-transparent pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <CreditCard className="h-5 w-5 text-primary-main" />
                    Payment methods
                  </CardTitle>
                  <p className="mt-1 text-xs text-grey-500 leading-relaxed">
                    Toggle what shoppers can use at checkout. Keep at least
                    Stripe or COD on.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
              <PaymentRow
                icon={<CreditCard className="h-5 w-5" />}
                iconClassName="bg-[#635BFF]/10 text-[#635BFF]"
                title="Stripe"
                description="Credit & debit cards via Stripe Checkout"
                checked={config.enableStripe}
                onCheckedChange={(v) => updateField("enableStripe", v)}
                badge={config.enableStripe ? "Live" : undefined}
              />
              <PaymentRow
                icon={<Banknote className="h-5 w-5" />}
                iconClassName="bg-success-lighter text-success-dark"
                title="Cash on Delivery"
                description="Collect payment when the order arrives"
                checked={config.enableCod}
                onCheckedChange={(v) => updateField("enableCod", v)}
                badge={config.enableCod ? "Live" : undefined}
              />
              <PaymentRow
                icon={<Landmark className="h-5 w-5" />}
                iconClassName="bg-info-lighter text-info-dark"
                title="Bank Transfer"
                description="Manual bank payment on the storefront"
                checked={config.enableBankTransfer}
                onCheckedChange={(v) => updateField("enableBankTransfer", v)}
                badge="Soon"
                badgeVariant="soon"
              />
              <PaymentRow
                icon={<Wallet className="h-5 w-5" />}
                iconClassName="bg-secondary-lighter text-secondary-dark"
                title="PayPal"
                description="PayPal wallet checkout"
                checked={config.enablePaypal}
                onCheckedChange={(v) => updateField("enablePaypal", v)}
                badge="Soon"
                badgeVariant="soon"
              />
            </CardContent>
          </Card>

          {/* Store + appearance — side column */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="border-b border-border/60 bg-gradient-to-r from-info-lighter/40 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Store className="h-5 w-5 text-info-main" />
                  Store details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 p-4 sm:p-5">
                <FieldShell label="Store name" htmlFor="storeName">
                  <Input
                    id="storeName"
                    value={config.storeName}
                    onChange={(e) => updateField("storeName", e.target.value)}
                    className="h-10 rounded-xl"
                    placeholder="Sellzy"
                  />
                </FieldShell>
                <FieldShell
                  label="Support email"
                  htmlFor="supportEmail"
                  hint="Shown for customer support & order emails"
                >
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400" />
                    <Input
                      id="supportEmail"
                      type="email"
                      value={config.supportEmail}
                      onChange={(e) =>
                        updateField("supportEmail", e.target.value)
                      }
                      className="h-10 rounded-xl pl-9"
                      placeholder="support@yourstore.com"
                    />
                  </div>
                </FieldShell>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Monitor className="h-5 w-5 text-primary-main" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                <p className="mb-3 text-xs text-grey-500">Admin panel theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "light", label: "Light", icon: Sun },
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "system", label: "System", icon: Monitor },
                    ] as const
                  ).map((opt) => {
                    const Icon = opt.icon;
                    const active = theme === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTheme(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-all",
                          active
                            ? "border-primary-main bg-primary-lighter text-primary-darker shadow-sm"
                            : "border-border bg-card text-grey-600 hover:border-grey-300 hover:bg-muted/40",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tax & shipping — full width row */}
          <Card className="overflow-hidden border-border/80 shadow-sm lg:col-span-12">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-warning-lighter/50 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Truck className="h-5 w-5 text-warning-dark" />
                Tax & shipping
              </CardTitle>
              <p className="mt-1 text-xs text-grey-500">
                Applied on cart totals and order creation.
              </p>
            </CardHeader>
            <CardContent className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
              <FieldShell
                label="Tax rate"
                htmlFor="taxPercent"
                hint={`${taxPercent}% of cart subtotal`}
              >
                <div className="relative">
                  <Input
                    id="taxPercent"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={taxPercent}
                    onChange={(e) => {
                      const pct = Math.min(
                        100,
                        Math.max(0, Number(e.target.value) || 0),
                      );
                      updateField("taxRate", pct / 100);
                    }}
                    className="h-10 rounded-xl pr-8"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-grey-400">
                    %
                  </span>
                </div>
              </FieldShell>

              <FieldShell
                label="Shipping cost"
                htmlFor="shippingCost"
                hint="Flat rate when free shipping is not met"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-grey-400">
                    {config.currency}
                  </span>
                  <Input
                    id="shippingCost"
                    type="number"
                    min={0}
                    step={0.01}
                    value={config.shippingCost}
                    onChange={(e) =>
                      updateField(
                        "shippingCost",
                        Math.max(0, Number(e.target.value) || 0),
                      )
                    }
                    className="h-10 rounded-xl pl-12"
                  />
                </div>
              </FieldShell>

              <FieldShell
                label="Free delivery from"
                htmlFor="freeDelivery"
                hint="Orders at or above this amount ship free"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-grey-400">
                    {config.currency}
                  </span>
                  <Input
                    id="freeDelivery"
                    type="number"
                    min={0}
                    step={1}
                    value={config.freeDeliveryThreshold}
                    onChange={(e) =>
                      updateField(
                        "freeDeliveryThreshold",
                        Math.max(0, Number(e.target.value) || 0),
                      )
                    }
                    className="h-10 rounded-xl pl-12"
                  />
                </div>
              </FieldShell>

              <FieldShell
                label="Currency"
                htmlFor="currency"
                hint="ISO code used for display & Stripe"
              >
                <Select
                  value={config.currency}
                  onValueChange={(v) => updateField("currency", v)}
                >
                  <SelectTrigger id="currency" className="h-10 rounded-xl">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "GBP", "CAD", "AUD", "PKR", "INR", "BDT"].map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </FieldShell>
            </CardContent>
          </Card>

          {/* Config shortcuts */}
          <Card className="overflow-hidden border-border/80 shadow-sm lg:col-span-12">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-bold">
                All configuration pages
              </CardTitle>
              <p className="mt-1 text-xs text-grey-500">
                Jump to every other settings area in the admin panel.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
              {configLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary-main/30 hover:bg-primary-lighter/30 hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-lighter text-primary-darker transition-colors group-hover:bg-primary-main group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-grey-900">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-grey-500">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-grey-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-main" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md dark:bg-card/95">
          <p className="hidden text-xs text-grey-500 sm:block">
            Changes apply to checkout after you save.
          </p>
          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="h-10 rounded-xl bg-primary-main px-5 font-semibold shadow-sm hover:bg-primary-dark"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
