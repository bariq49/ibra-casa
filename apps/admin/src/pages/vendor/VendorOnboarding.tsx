import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, ShieldAlert, Ban, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";
import useVendorStore, { type VendorRecord } from "@/store/useVendorStore";
import { getErrorMessage } from "@/lib/errors";

const applySchema = z.object({
  storeName: z.string().min(2, "Store name is required"),
  registrationNumber: z.string().min(2, "Registration number is required"),
  description: z.string().min(10, "Tell us a bit about your store (10+ chars)"),
  contactPhone: z.string().min(6, "Contact phone is required"),
  street: z.string().min(2, "Street is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(2, "Postal code is required"),
});

type ApplyForm = z.infer<typeof applySchema>;

function StatusCard({
  icon: Icon,
  iconClass,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-md w-full bg-background rounded-2xl shadow-sm border border-border p-8 text-center">
      <div
        className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 ${iconClass}`}
      >
        <Icon size={28} />
      </div>
      <h2 className="text-xl font-bold text-grey-900 mb-2">{title}</h2>
      <div className="text-sm text-grey-600 leading-relaxed">{children}</div>
    </div>
  );
}

function ApplyForm({ onApplied }: { onApplied: (v: VendorRecord) => void }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      storeName: "",
      registrationNumber: "",
      description: "",
      contactPhone: "",
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  async function onSubmit(values: ApplyForm) {
    setSubmitting(true);
    try {
      const { data } = await adminApi.post(ADMIN_API_ENDPOINTS.VENDOR_REGISTER, {
        storeName: values.storeName,
        registrationNumber: values.registrationNumber,
        description: values.description,
        contactPhone: values.contactPhone,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          country: values.country,
          postalCode: values.postalCode,
        },
      });
      toast({
        title: "Application submitted",
        description: "We'll review your store and get back to you shortly.",
      });
      onApplied(data?.data);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not submit",
        description: getErrorMessage(err, "Try again"),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl w-full bg-background rounded-2xl shadow-sm border border-border p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-lighter text-primary-dark flex items-center justify-center">
          <Store size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-grey-900">Become a Sellzy Vendor</h2>
          <p className="text-sm text-grey-600">
            Tell us about your store. Once approved you'll get the seller dashboard.
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Store name</Label>
            <Input {...form.register("storeName")} placeholder="My Store" />
            {form.formState.errors.storeName && (
              <p className="text-xs text-error-main mt-1">
                {form.formState.errors.storeName.message}
              </p>
            )}
          </div>
          <div>
            <Label>Registration number</Label>
            <Input {...form.register("registrationNumber")} placeholder="REG-12345" />
            {form.formState.errors.registrationNumber && (
              <p className="text-xs text-error-main mt-1">
                {form.formState.errors.registrationNumber.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label>Short description</Label>
          <Textarea
            {...form.register("description")}
            placeholder="What do you sell?"
            rows={3}
          />
          {form.formState.errors.description && (
            <p className="text-xs text-error-main mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Label>Contact phone</Label>
          <Input {...form.register("contactPhone")} placeholder="+880…" />
          {form.formState.errors.contactPhone && (
            <p className="text-xs text-error-main mt-1">
              {form.formState.errors.contactPhone.message}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Street</Label>
            <Input {...form.register("street")} />
          </div>
          <div>
            <Label>City</Label>
            <Input {...form.register("city")} />
          </div>
          <div>
            <Label>State</Label>
            <Input {...form.register("state")} />
          </div>
          <div>
            <Label>Country</Label>
            <Input {...form.register("country")} />
          </div>
          <div>
            <Label>Postal code</Label>
            <Input {...form.register("postalCode")} />
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary-main hover:bg-primary-dark text-white px-6"
          >
            {submitting ? "Submitting…" : "Submit application"}{" "}
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function VendorOnboarding() {
  const { vendor, fetched, fetchVendor, setVendor } = useVendorStore();

  useEffect(() => {
    if (!fetched) fetchVendor();
  }, [fetched, fetchVendor]);

  if (!fetched) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-grey-500">
        Loading…
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <ApplyForm onApplied={(v) => setVendor(v)} />
      </div>
    );
  }

  if (vendor.status === "pending") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <StatusCard
          icon={Clock}
          iconClass="bg-info-lighter text-info-main"
          title="Application under review"
        >
          We've received your application for{" "}
          <strong className="text-grey-900">{vendor.storeName}</strong>. Our team
          usually reviews within 1–2 business days. You'll get a notification once
          it's approved.
        </StatusCard>
      </div>
    );
  }

  if (vendor.status === "rejected") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <StatusCard
          icon={ShieldAlert}
          iconClass="bg-error-lighter text-error-main"
          title="Application not approved"
        >
          {vendor.rejectionReason ? (
            <>
              <p className="mb-3">{vendor.rejectionReason}</p>
            </>
          ) : (
            <p className="mb-3">
              Your application wasn't approved. You can update the details and
              re-apply.
            </p>
          )}
          <Button
            onClick={() => useVendorStore.setState({ vendor: null })}
            className="mt-2 rounded-full bg-primary-main hover:bg-primary-dark text-white"
          >
            Re-apply
          </Button>
        </StatusCard>
      </div>
    );
  }

  // suspended
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <StatusCard
        icon={Ban}
        iconClass="bg-warning-lighter text-warning-dark"
        title="Account suspended"
      >
        Your vendor account is currently suspended. Please contact support to
        resolve this.
        {vendor.rejectionReason && (
          <p className="mt-3 text-grey-700">Reason: {vendor.rejectionReason}</p>
        )}
      </StatusCard>
    </div>
  );
}
