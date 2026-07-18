import { useEffect } from "react";
import { Store, Mail, Phone, MapPin, Hash, FileText } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import useVendorStore from "@/store/useVendorStore";
import { Skeleton } from "@/components/ui/skeleton";

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-lg bg-primary-lighter text-primary-dark flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-grey-500 mb-0.5">
          {label}
        </div>
        <div className="text-sm font-medium text-grey-900 break-words">
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

export default function VendorSettings() {
  const { user } = useAuthStore();
  const { vendor, fetched, fetchVendor } = useVendorStore();

  useEffect(() => {
    if (!fetched) fetchVendor();
  }, [fetched, fetchVendor]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-grey-900">Settings</h1>
        <p className="text-sm text-grey-500">
          Your seller profile and store details.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="bg-background rounded-2xl border border-border p-5 md:p-6">
          <h2 className="font-semibold text-grey-900 mb-2">Account</h2>
          {!user ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <>
              <Field icon={Store} label="Name" value={user.name} />
              <Field icon={Mail} label="Email" value={user.email} />
              <Field
                icon={Hash}
                label="Role"
                value={user.role?.toUpperCase()}
              />
            </>
          )}
        </section>

        <section className="bg-background rounded-2xl border border-border p-5 md:p-6">
          <h2 className="font-semibold text-grey-900 mb-2">Store</h2>
          {!fetched ? (
            <Skeleton className="h-40 w-full" />
          ) : !vendor ? (
            <p className="text-sm text-grey-500">
              No vendor profile found yet.
            </p>
          ) : (
            <>
              <Field icon={Store} label="Store name" value={vendor.storeName} />
              <Field
                icon={Hash}
                label="Registration number"
                value={vendor.registrationNumber}
              />
              <Field
                icon={FileText}
                label="Description"
                value={vendor.description}
              />
              <Field icon={Mail} label="Contact email" value={vendor.contactEmail} />
              <Field icon={Phone} label="Contact phone" value={vendor.contactPhone} />
              <Field
                icon={MapPin}
                label="Address"
                value={
                  vendor.address
                    ? [
                        vendor.address.street,
                        vendor.address.city,
                        vendor.address.state,
                        vendor.address.country,
                        vendor.address.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : ""
                }
              />
              <Field
                icon={Hash}
                label="Status"
                value={vendor.status?.toUpperCase()}
              />
            </>
          )}
        </section>
      </div>

      <p className="text-xs text-grey-500">
        Editing store details will be available in the next release. Please contact
        the platform admin if you need a change in the meantime.
      </p>
    </div>
  );
}
