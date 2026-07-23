import { useEffect, useState } from "react";
import { useParams } from "react-router";
import VendorProductForm, {
  type VendorProductFormValues,
} from "@/components/vendor/VendorProductForm";
import { adminApi } from "@/lib/config";

export default function VendorProductEdit() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<VendorProductFormValues> | null>(
    null,
  );

  useEffect(() => {
    if (!id) return;
    adminApi
      .get(`/products/${id}`)
      .then(({ data }) => {
        const p = data?.data ?? data;
        if (!p) return;
        const imgs = Array.isArray(p.images) && p.images.length > 0
          ? p.images
          : p.image
            ? [p.image]
            : [];
        const idOf = (v: unknown): string => {
          if (v && typeof v === "object" && "_id" in v) {
            const id = (v as { _id?: unknown })._id;
            return typeof id === "string" ? id : "";
          }
          return typeof v === "string" ? v : "";
        };
        const idsOf = (arr: unknown): string[] =>
          Array.isArray(arr) ? arr.map(idOf).filter(Boolean) : [];
        setInitial({
          name: p.name ?? "",
          slug: p.slug ?? "",
          description: p.description ?? "",
          category: idOf(p.category),
          brand: idOf(p.brand),
          productBase: idOf(p.productBase),
          productTypes: idsOf(p.productTypes),
          sizes: idsOf(p.sizes),
          colors: idsOf(p.colors),
          weights: idsOf(p.weights),
          price: p.price ?? 0,
          purchasePrice: p.purchasePrice ?? 0,
          stock: p.stock ?? 0,
          purchasedQuantity: p.purchasedQuantity ?? 0,
          discountPercentage: p.discountPercentage ?? 0,
          bg: p.bg ?? "",
          isNewItem: !!p.isNewItem,
          images: imgs,
          faqs: Array.isArray(p.faqs)
            ? p.faqs.map((f: { question?: string; answer?: string }) => ({
                question: f.question ?? "",
                answer: f.answer ?? "",
              }))
            : [],
        });
      })
      .catch(() => setInitial({}));
  }, [id]);

  if (!id || !initial) {
    return <div className="text-grey-500">Loading…</div>;
  }

  return <VendorProductForm mode="edit" productId={id} initialValues={initial} />;
}
