import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Search,
  User as UserIcon,
  Store,
  Check,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/config";
import { useDebounce } from "@/hooks/use-debounce";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  userId: z.string().min(1, "Pick a user to attach this vendor to"),
  storeName: z.string().min(2, "Store name is required"),
  registrationNumber: z.string().optional(),
  description: z.string().min(10, "Tell us a bit about the store"),
  contactEmail: z.string().email("Valid contact email required"),
  contactPhone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  status: z.enum(["pending", "approved"]),
});

type Values = z.infer<typeof schema>;

type SearchUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
};

export default function CreateVendorSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const { toast } = useToast();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: "",
      storeName: "",
      registrationNumber: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      status: "approved",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [picked, setPicked] = useState<SearchUser | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  // Fetch users when search updates and sheet is open.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoadingUsers(true);
    adminApi
      .get("/users", {
        params: {
          page: 1,
          perPage: 8,
          search: debouncedSearch || undefined,
        },
      })
      .then(({ data }) => {
        if (!active) return;
        setUsers(data?.users ?? data?.data ?? []);
      })
      .catch(() => active && setUsers([]))
      .finally(() => active && setLoadingUsers(false));
    return () => {
      active = false;
    };
  }, [debouncedSearch, open]);

  // Reset on close.
  useEffect(() => {
    if (!open) {
      form.reset();
      setSearch("");
      setUsers([]);
      setPicked(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function pickUser(u: SearchUser) {
    setPicked(u);
    form.setValue("userId", u._id);
    if (u.email && !form.getValues("contactEmail")) {
      form.setValue("contactEmail", u.email);
    }
  }

  async function onSubmit(values: Values) {
    setSubmitting(true);
    try {
      await adminApi.post("/vendors/create", {
        userId: values.userId,
        storeName: values.storeName,
        registrationNumber: values.registrationNumber || undefined,
        description: values.description,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone || undefined,
        address: {
          street: values.street || undefined,
          city: values.city || undefined,
          state: values.state || undefined,
          country: values.country || undefined,
          postalCode: values.postalCode || undefined,
        },
        status: values.status,
        role: "vendor",
      });
      toast({
        title: "Vendor created",
        description: `${values.storeName} added with status ${values.status}.`,
      });
      onCreated?.();
      onOpenChange(false);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not create vendor",
        description: getErrorMessage(err, "Try again."),
      });
    } finally {
      setSubmitting(false);
    }
  }

  const showUserResults = useMemo(
    () => !picked && (debouncedSearch.length > 0 || users.length > 0),
    [picked, debouncedSearch, users],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl flex items-center gap-2">
            <Store size={18} />
            Add Vendor
          </SheetTitle>
          <SheetDescription>
            Pick the user that owns the store, then fill in their store details.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
          >
            {/* User picker */}
            <div className="rounded-xl border border-border p-4 space-y-3 bg-muted/30">
              <div className="text-xs font-semibold text-grey-700 uppercase tracking-wider">
                Owner account
              </div>

              {picked ? (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                  <div className="w-9 h-9 rounded-full bg-primary-lighter text-primary-dark flex items-center justify-center">
                    <UserIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-grey-900 truncate">
                      {picked.name ?? picked.email}
                    </div>
                    <div className="text-xs text-grey-500 truncate">
                      {picked.email}{" "}
                      {picked.role && (
                        <Badge variant="outline" className="ml-1 text-[10px]">
                          {picked.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => {
                      setPicked(null);
                      form.setValue("userId", "");
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search users by name or email…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 rounded-full bg-background"
                    />
                  </div>
                  {showUserResults && (
                    <div className="border border-border rounded-lg bg-background divide-y divide-border max-h-64 overflow-y-auto">
                      {loadingUsers ? (
                        <div className="p-3 space-y-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : users.length === 0 ? (
                        <div className="p-4 text-sm text-grey-500 text-center">
                          No users match "{debouncedSearch}".
                        </div>
                      ) : (
                        users.map((u) => (
                          <button
                            type="button"
                            key={u._id}
                            onClick={() => pickUser(u)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-grey-100 text-grey-700 flex items-center justify-center text-xs font-bold">
                              {(u.name ?? u.email ?? "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-grey-900 truncate">
                                {u.name ?? u.email}
                              </div>
                              <div className="text-xs text-grey-500 truncate">
                                {u.email}
                              </div>
                            </div>
                            {u.role && (
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase"
                              >
                                {u.role}
                              </Badge>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}

              {form.formState.errors.userId && (
                <p className="text-xs text-error-main">
                  {form.formState.errors.userId.message}
                </p>
              )}
            </div>

            {/* Store details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Acme Co." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="REG-12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="What does the store sell?"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+880 …" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Initial status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="approved">
                          Approved (active immediately)
                        </SelectItem>
                        <SelectItem value="pending">
                          Pending (queue for review)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="text-xs font-semibold text-grey-700 uppercase tracking-wider pt-2">
              Address
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-primary-main hover:bg-primary-dark text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" />{" "}
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={14} className="mr-1.5" /> Create vendor
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
