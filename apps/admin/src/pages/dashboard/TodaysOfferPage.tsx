import { useCallback, useEffect, useMemo, useState } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Save,
  Trash2,
  Clock,
  Package,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type OfferProduct = {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  price?: number;
};

type OfferForm = {
  title: string;
  description: string;
  endsAt: string;
  isActive: boolean;
  products: OfferProduct[];
};

function toLocalInputValue(iso?: string | Date) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function normalizeProducts(data: unknown): OfferProduct[] {
  const list = Array.isArray(data)
    ? data
    : (data as { products?: OfferProduct[] })?.products ||
      (data as { data?: OfferProduct[] })?.data ||
      [];
  return list.map((p) => ({
    _id: p._id,
    name: p.name,
    slug: p.slug,
    image: p.image,
    price: p.price,
  }));
}

export default function TodaysOfferPage() {
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allProducts, setAllProducts] = useState<OfferProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<OfferForm>({
    title: "Today's Top Offer",
    description: "Up to 69% discount for limited time 🔥",
    endsAt: "",
    isActive: true,
    products: [],
  });

  const availableProducts = useMemo(
    () =>
      allProducts.filter(
        (p) => !form.products.some((selected) => selected._id === p._id),
      ),
    [allProducts, form.products],
  );

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const [offerRes, productsRes] = await Promise.all([
        axiosPrivate.get("/todays-offer/admin"),
        axiosPrivate.get("/products?perPage=200&limit=200"),
      ]);

      const data = offerRes.data;
      setForm({
        title: data.title || "Today's Top Offer",
        description: data.description || "",
        endsAt: toLocalInputValue(data.endsAt),
        isActive: data.isActive !== false,
        products: normalizeProducts(data.products),
      });
      setAllProducts(normalizeProducts(productsRes.data));
    } catch (err: any) {
      toast({
        title: "Failed to load offer",
        description: err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, toast]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const addProductFromDropdown = (id: string) => {
    if (!id) return;
    const product = allProducts.find((p) => p._id === id);
    if (!product) return;
    setForm((prev) => {
      if (prev.products.some((p) => p._id === product._id)) return prev;
      return { ...prev, products: [...prev.products, product] };
    });
    setSelectedId("");
  };

  const removeProduct = (id: string) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p._id !== id),
    }));
  };

  const moveProduct = (index: number, dir: -1 | 1) => {
    setForm((prev) => {
      const next = [...prev.products];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, products: next };
    });
  };

  const handleSave = async () => {
    if (!form.endsAt) {
      toast({
        title: "End time required",
        description: "Please set when the offer countdown should end.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await axiosPrivate.put("/todays-offer", {
        title: form.title,
        description: form.description,
        endsAt: new Date(form.endsAt).toISOString(),
        isActive: form.isActive,
        products: form.products.map((p) => p._id),
      });
      toast({ title: "Offer saved" });
      await loadPage();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Today&apos;s Offer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose products and set the countdown end time for the homepage
            offer section.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Offer
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4" />
              Offer details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">Offer ends at</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endsAt: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                This drives the &quot;End in&quot; countdown on the storefront.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-3">
              <div>
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Hide the section on the website when off.
                </p>
              </div>
              <Switch
                id="active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="size-4" />
              Add products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select product</Label>
              <Select
                value={selectedId || undefined}
                onValueChange={addProductFromDropdown}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a product to add..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {availableProducts.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      {allProducts.length === 0
                        ? "No products found"
                        : "All products already added"}
                    </SelectItem>
                  ) : (
                    availableProducts.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                        {product.price != null
                          ? ` — ${Number(product.price).toFixed(2)}`
                          : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {allProducts.length} products available. Pick one to add it to
                the offer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Selected products ({form.products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {form.products.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
              No products yet. Use the dropdown above to add products.
            </div>
          ) : (
            <div className="space-y-2">
              {form.products.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt=""
                      className="size-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    {product.price != null && (
                      <p className="text-xs text-muted-foreground">
                        {Number(product.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => moveProduct(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => moveProduct(index, 1)}
                      disabled={index === form.products.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeProduct(product._id)}
                      aria-label="Remove"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
