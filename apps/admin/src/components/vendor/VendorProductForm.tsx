import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Save, RefreshCw, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { NestedCategorySelector } from "@/components/products/NestedCategorySelector";
import { AsyncProductTypeSelect } from "@/components/products/AsyncProductTypeSelect";
import { useToast } from "@/hooks/use-toast";
import { usePreviewGuard } from "@/hooks/usePreviewGuard";
import { adminApi, ADMIN_API_ENDPOINTS } from "@/lib/config";
import { getErrorMessage } from "@/lib/errors";
import { formatVariantLabel } from "@/lib/variantPricing";
import { VariantPricePreview } from "@/components/products/VariantPricePreview";

// Schema mirrors the admin productSchema, plus purchasePrice (vendor cost).
const vendorProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z
    .string()
    .refine(
      (val) => val.replace(/<[^>]*>/g, "").trim().length >= 10,
      { message: "Description must be at least 10 characters" },
    ),
  price: z.number().min(0, "Price must be a positive number"),
  purchasePrice: z.number().min(0).optional(),
  discountPercentage: z.number().min(0).max(100),
  stock: z.number().min(0),
  purchasedQuantity: z.number().min(0),
  category: z.string().min(1, "Please select a category"),
  brand: z.string().min(1, "Please select a brand"),
  productBase: z.string().optional(),
  productTypes: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  weights: z.array(z.string()).optional(),
  bg: z.string().optional(),
  isNewItem: z.boolean().optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      }),
    )
    .optional()
    .default([]),
  images: z
    .array(z.string())
    .min(1, "Please upload at least one image")
    .max(
      parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES as string) || 6,
      `Maximum ${parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES as string) || 6} images allowed`,
    ),
});

export type VendorProductFormValues = z.infer<typeof vendorProductSchema>;

type Option = { _id: string; name: string; title?: string; priceModifier?: number };

const MAX_IMAGES =
  parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES as string) || 6;

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "color",
  "align",
  "link",
  "blockquote",
];

export default function VendorProductForm({
  mode,
  productId,
  initialValues,
}: {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: Partial<VendorProductFormValues>;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { blockIfPreview } = usePreviewGuard();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [productBases, setProductBases] = useState<Option[]>([]);
  const [sizes, setSizes] = useState<Option[]>([]);
  const [colors, setColors] = useState<Option[]>([]);
  const [weights, setWeights] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const form = useForm<VendorProductFormValues>({
    resolver: zodResolver(vendorProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      purchasePrice: 0,
      discountPercentage: 0,
      stock: 0,
      purchasedQuantity: 0,
      category: "",
      brand: "",
      productBase: "",
      productTypes: [],
      sizes: [],
      colors: [],
      weights: [],
      bg: "",
      isNewItem: false,
      faqs: [],
      images: [],
      ...initialValues,
    },
  });

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  // Reset when initial values arrive (edit mode loads asynchronously).
  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: "",
        slug: "",
        description: "",
        price: 0,
        purchasePrice: 0,
        discountPercentage: 0,
        stock: 0,
        purchasedQuantity: 0,
        category: "",
        brand: "",
        productBase: "",
        productTypes: [],
        sizes: [],
        colors: [],
        weights: [],
        bg: "",
        isNewItem: false,
        faqs: [],
        images: [],
        ...initialValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  // Fetch all option lists in parallel.
  useEffect(() => {
    let active = true;
    setLoadingOptions(true);
    Promise.all([
      adminApi.get("/categories/admin", {
        params: { page: 1, perPage: 1000, sortOrder: "asc" },
      }),
      adminApi.get("/brands", {
        params: { page: 1, perPage: 200, sortOrder: "asc" },
      }),
      adminApi.get("/product-bases").catch(() => null),
      adminApi.get("/sizes").catch(() => null),
      adminApi.get("/colors").catch(() => null),
      adminApi.get("/weights").catch(() => null),
    ])
      .then(([catsRes, brandsRes, basesRes, sizesRes, colorsRes, weightsRes]) => {
        if (!active) return;
        setCategories(catsRes?.data?.categories ?? []);
        setBrands(brandsRes?.data?.brands ?? brandsRes?.data ?? []);
        setProductBases(basesRes?.data ?? []);
        setSizes(sizesRes?.data ?? []);
        setColors(colorsRes?.data ?? []);
        setWeights(weightsRes?.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        toast({
          variant: "destructive",
          title: "Could not load form options",
          description: "Try refreshing the page.",
        });
      })
      .finally(() => active && setLoadingOptions(false));
    return () => {
      active = false;
    };
  }, [toast]);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ color: [] }],
        [{ align: [] }],
        ["blockquote", "link"],
        ["clean"],
      ],
    }),
    [],
  );

  async function onSubmit(values: VendorProductFormValues) {
    if (blockIfPreview(mode === "create" ? "create products" : "update products")) {
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        image: values.images[0],
        brand: values.brand || undefined,
      };
      if (mode === "create") {
        await adminApi.post(ADMIN_API_ENDPOINTS.VENDOR_PRODUCTS, payload);
        toast({
          title: "Product submitted",
          description: "Your product is awaiting admin approval.",
        });
      } else if (productId) {
        await adminApi.put(
          ADMIN_API_ENDPOINTS.VENDOR_PRODUCT_BY_ID(productId),
          payload,
        );
        toast({ title: "Product updated" });
      }
      navigate("/vendor/products");
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Could not save",
        description: getErrorMessage(err, "Try again"),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-3">
          <Link
            to="/vendor/products"
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-grey-700"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-xl font-bold text-grey-900">
            {mode === "create" ? "Create Product" : "Edit Product"}
          </h1>
        </div>

        {/* Basic Information */}
        <section className="bg-background rounded-2xl border border-border p-5 md:p-6 space-y-4">
          <h2 className="font-semibold text-grey-900">Basic Information</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={submitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Slug (URL-friendly){" "}
                  <span className="text-xs text-muted-foreground ml-2">
                    Optional — auto-generated if left empty
                  </span>
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      disabled={submitting}
                      placeholder="e.g., baby-bear-outfit-clothing"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const name = form.getValues("name");
                      if (name) {
                        const slug = name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        form.setValue("slug", slug);
                      }
                    }}
                    disabled={submitting || !form.watch("name")}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <div className="rounded-md border border-input overflow-hidden [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-input [&_.ql-toolbar]:bg-muted/30 [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:border-0 [&_.ql-container]:min-h-[180px] [&_.ql-editor]:min-h-[160px] [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed">
                    <ReactQuill
                      theme="snow"
                      value={String(field.value ?? "")}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={QUILL_FORMATS}
                      readOnly={submitting}
                      placeholder="Write a detailed product description..."
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* Pricing & Stock */}
        <section className="bg-background rounded-2xl border border-border p-5 md:p-6 space-y-4">
          <h2 className="font-semibold text-grey-900">Pricing & Stock</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      disabled={submitting}
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      disabled={submitting}
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price (cost)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      disabled={submitting}
                      {...field}
                      value={field.value === 0 ? "" : (field.value ?? "")}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasedQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Qty</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      disabled={submitting}
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : parseInt(e.target.value, 10),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      disabled={submitting}
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : parseInt(e.target.value, 10),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Classification */}
        <section className="bg-background rounded-2xl border border-border p-5 md:p-6 space-y-4">
          <h2 className="font-semibold text-grey-900">Classification</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="productBase"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Product Base</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={submitting || loadingOptions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingOptions ? "Loading…" : "Select a product base"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {productBases.map((base) => (
                        <SelectItem key={base._id} value={base._id}>
                          {base.title || base.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <NestedCategorySelector
                      categories={categories}
                      value={field.value as string}
                      onValueChange={field.onChange}
                      disabled={submitting || loadingOptions}
                      placeholder="Select a category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={submitting || loadingOptions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingOptions ? "Loading…" : "Select a brand"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {brands.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productTypes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Product Types (Optional)</FormLabel>
                  <FormControl>
                    <AsyncProductTypeSelect
                      value={(field.value as string[]) || []}
                      onChange={field.onChange}
                      productBase={form.watch("productBase") || ""}
                      disabled={submitting || !form.watch("productBase")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isNewItem"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-auto md:col-span-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base text-muted-foreground">
                      New Arrival Badge
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={submitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Variants */}
        <section className="bg-background rounded-2xl border border-border p-5 md:p-6 space-y-4">
          <h2 className="font-semibold text-grey-900">Variants & Style</h2>

          <FormField
            control={form.control}
            name="bg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Color (Optional)</FormLabel>
                <FormControl>
                  <div className="flex gap-2 items-center">
                    <Input
                      {...field}
                      type="color"
                      className="w-12 h-10 p-1 cursor-pointer"
                      disabled={submitting}
                    />
                    <Input
                      {...field}
                      type="text"
                      placeholder="#F4F3F5"
                      className="flex-1 uppercase font-mono"
                      disabled={submitting}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sizes</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={sizes.map((s) => ({
                        label: formatVariantLabel(s),
                        value: s._id,
                      }))}
                      selected={(field.value as string[]) || []}
                      onChange={field.onChange}
                      placeholder="Select sizes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colors</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={colors.map((c) => ({
                        label: formatVariantLabel(c),
                        value: c._id,
                      }))}
                      selected={(field.value as string[]) || []}
                      onChange={field.onChange}
                      placeholder="Select colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weights</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={weights.map((w) => ({
                        label: formatVariantLabel(w),
                        value: w._id,
                      }))}
                      selected={(field.value as string[]) || []}
                      onChange={field.onChange}
                      placeholder="Select weights"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <VariantPricePreview
            basePrice={Number(form.watch("price")) || 0}
            discountPercentage={Number(form.watch("discountPercentage")) || 0}
            selectedSizes={(form.watch("sizes") as string[]) || []}
            selectedColors={(form.watch("colors") as string[]) || []}
            selectedWeights={(form.watch("weights") as string[]) || []}
            sizes={sizes}
            colors={colors}
            weights={weights}
          />
        </section>

        {/* Product FAQs */}
        <section className="bg-background rounded-2xl border border-border p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-grey-900">Product FAQs</h2>
              <p className="text-xs text-grey-500">
                Shown in the FAQs tab on the product detail page
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => appendFaq({ question: "", answer: "" })}
              disabled={submitting}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add FAQ
            </Button>
          </div>
          {faqFields.length === 0 ? (
            <p className="text-xs text-grey-500">
              No FAQs yet. Add questions customers often ask about this product.
            </p>
          ) : (
            <div className="space-y-4">
              {faqFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-xl border border-dashed border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-grey-500">
                      FAQ {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => removeFaq(index)}
                      disabled={submitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`faqs.${index}.question`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. What materials is this made of?"
                            disabled={submitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`faqs.${index}.answer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Answer</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[80px]"
                            placeholder="Write a clear answer for customers..."
                            disabled={submitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Images */}
        <section className="bg-background rounded-2xl border border-border p-5 md:p-6 space-y-2">
          <h2 className="font-semibold text-grey-900">Product Images</h2>
          <p className="text-xs text-grey-500">
            The first image is your cover. Drag to reorder. Up to {MAX_IMAGES}{" "}
            images, jpeg / jpg / png / gif.
          </p>
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MultiImageUpload
                    value={(field.value as string[]) || []}
                    onChange={field.onChange}
                    maxImages={MAX_IMAGES}
                    disabled={submitting}
                    deferUpload
                    disableServerDelete
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/vendor/products")}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary-main hover:bg-primary-dark text-white"
          >
            <Save size={16} className="mr-1" />
            {submitting ? "Saving…" : mode === "create" ? "Save" : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
