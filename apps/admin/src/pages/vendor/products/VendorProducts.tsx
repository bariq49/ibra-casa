import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, Pencil, Trash2, Plus, Search, ImageOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";
import { usePreviewGuard } from "@/hooks/usePreviewGuard";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/utils";

type VendorProduct = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  category?: { _id: string; name: string } | string;
  brand?: { _id: string; name: string } | string;
  createdAt?: string;
};

type Tab = "all" | "draft" | "stock" | "review";

const TAB_LABEL: Record<Tab, string> = {
  all: "All Products",
  draft: "Draft Products",
  stock: "Stock Products",
  review: "Product Review",
};

const TAB_HINT: Record<Tab, string> = {
  all: "Every product you have submitted, regardless of status.",
  draft: "Products awaiting your final submission.",
  stock: "Approved products with current stock levels.",
  review: "Products waiting on platform admin approval.",
};

function statusToQuery(tab: Tab): string | undefined {
  if (tab === "review") return "pending";
  if (tab === "stock") return "approved";
  return undefined; // all + draft fall through (draft is filtered client-side)
}

function StatusPill({ status }: { status?: VendorProduct["approvalStatus"] }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    approved: {
      bg: "bg-success-lighter",
      text: "text-success-dark",
      label: "Publish",
    },
    pending: {
      bg: "bg-warning-lighter",
      text: "text-warning-dark",
      label: "Review",
    },
    rejected: {
      bg: "bg-error-lighter",
      text: "text-error-dark",
      label: "Rejected",
    },
  };
  const meta = status ? map[status] : map.pending;
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.text}`}
    >
      {meta.label}
    </span>
  );
}

export default function VendorProducts({ tab }: { tab: Tab }) {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { blockIfPreview } = usePreviewGuard();

  useEffect(() => {
    let active = true;
    setLoading(true);
    const status = statusToQuery(tab);

    adminApi
      .get(ADMIN_API_ENDPOINTS.VENDOR_PRODUCTS, {
        params: status ? { status } : {},
      })
      .then(({ data }) => {
        if (!active) return;
        setProducts(data?.products ?? []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tab]);

  async function handleDelete(id: string) {
    if (blockIfPreview("delete products")) return;
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    try {
      await adminApi.delete(ADMIN_API_ENDPOINTS.VENDOR_PRODUCT_BY_ID(id));
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast({ title: "Product deleted" });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not delete",
        description: getErrorMessage(err, "Try again"),
      });
    }
  }

  function handleCreateClick() {
    // Preview users can open the form to explore the fields; the actual
    // save call is blocked inside VendorProductForm's submit handler.
    navigate("/vendor/products/new");
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-background rounded-2xl border border-border p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-grey-900">{TAB_LABEL[tab]}</h1>
          <p className="text-sm text-grey-500 mt-1">{TAB_HINT[tab]}</p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="rounded-full bg-primary-main hover:bg-primary-dark text-white"
        >
          <Plus size={16} className="mr-1" /> Create Product
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 border-b border-border">
        {(["all", "draft", "stock", "review"] as Tab[]).map((t) => {
          const isActive = t === tab;
          return (
            <Link
              key={t}
              to={
                t === "all" ? "/vendor/products" : `/vendor/products/${t}`
              }
              className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "text-primary-main border-primary-main"
                  : "text-grey-600 border-transparent hover:text-grey-900"
              }`}
            >
              {TAB_LABEL[t]}
            </Link>
          );
        })}
      </div>

      <div className="relative max-w-md mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-full bg-muted/40"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-grey-500">
                  No products yet. Create your first product to get started.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const categoryName =
                  typeof p.category === "object" ? p.category?.name : p.category;
                return (
                  <TableRow key={p._id}>
                    <TableCell className="text-grey-500 text-xs">
                      #{p._id.slice(-5)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-0">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-md object-cover bg-muted"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-grey-400">
                            <ImageOff size={16} />
                          </div>
                        )}
                        <span className="font-medium text-grey-900 truncate">
                          {p.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-grey-600">
                      {categoryName ?? "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary-main">
                      {formatCurrency(p.price)}
                    </TableCell>
                    <TableCell className="text-right">{p.stock}</TableCell>
                    <TableCell>
                      <StatusPill status={p.approvalStatus} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/vendor/products/${p._id}`}
                          className="p-2 rounded-full hover:bg-muted text-grey-600 hover:text-grey-900"
                          aria-label="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/vendor/products/${p._id}/edit`}
                          className="p-2 rounded-full hover:bg-muted text-grey-600 hover:text-grey-900"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p._id)}
                          className="p-2 rounded-full hover:bg-error-lighter text-grey-600 hover:text-error-main"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
