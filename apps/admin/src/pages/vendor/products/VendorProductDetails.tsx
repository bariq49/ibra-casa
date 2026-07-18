import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Pencil, ImageOff } from "lucide-react";
import { adminApi } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  purchasePrice?: number;
  stock: number;
  image?: string;
  images?: string[];
  approvalStatus?: "pending" | "approved" | "rejected";
  category?: { _id: string; name: string } | string;
  brand?: { _id: string; name: string } | string;
  discountPercentage?: number;
  createdAt?: string;
};

export default function VendorProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    adminApi
      .get(`/products/${id}`)
      .then(({ data }) => {
        if (!active) return;
        setProduct(data?.data ?? data ?? null);
      })
      .catch(() => active && setProduct(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-background rounded-2xl border border-border p-10 text-center text-grey-500">
        Product not found.
      </div>
    );
  }

  const categoryName =
    typeof product.category === "object" ? product.category?.name : product.category;
  const brandName =
    typeof product.brand === "object" ? product.brand?.name : product.brand;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/vendor/products"
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-grey-700"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-grey-900">{product.name}</h1>
        </div>
        <Button
          asChild
          className="rounded-full bg-primary-main hover:bg-primary-dark text-white"
        >
          <Link to={`/vendor/products/${product._id}/edit`}>
            <Pencil size={16} className="mr-1" /> Edit
          </Link>
        </Button>
      </div>

      <div className="bg-background rounded-2xl border border-border p-6 grid lg:grid-cols-2 gap-6">
        <div className="bg-muted/30 rounded-xl flex items-center justify-center min-h-[280px]">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[400px] object-contain"
            />
          ) : (
            <div className="text-grey-400 flex flex-col items-center">
              <ImageOff size={32} />
              <span className="text-sm mt-1">No image</span>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-grey-500">
            <span>Status:</span>
            <span className="font-medium text-grey-900">
              {product.approvalStatus ?? "pending"}
            </span>
          </div>
          <div className="text-3xl font-bold text-primary-main">{formatCurrency(product.price)}</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-grey-500">Stock</div>
              <div className="font-medium text-grey-900">{product.stock}</div>
            </div>
            <div>
              <div className="text-grey-500">Cost</div>
              <div className="font-medium text-grey-900">
                {product.purchasePrice ? formatCurrency(product.purchasePrice) : "—"}
              </div>
            </div>
            <div>
              <div className="text-grey-500">Category</div>
              <div className="font-medium text-grey-900">
                {categoryName ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-grey-500">Brand</div>
              <div className="font-medium text-grey-900">{brandName ?? "—"}</div>
            </div>
            <div>
              <div className="text-grey-500">Discount</div>
              <div className="font-medium text-grey-900">
                {product.discountPercentage ? `${product.discountPercentage}%` : "—"}
              </div>
            </div>
          </div>
          {product.description && (
            <div>
              <div className="text-grey-500 text-sm mb-1">Description</div>
              <p className="text-sm text-grey-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
