import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { productSchema } from "@/lib/validation";
import { DEFAULT_PER_PAGE } from "@/lib/pagination";
import { formatCurrency } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { NestedCategorySelector } from "@/components/products/NestedCategorySelector";
import { AsyncProductTypeSelect } from "@/components/products/AsyncProductTypeSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Loader2,
  Plus,
  Trash,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Upload,
  CheckCircle,
  XCircle,
  Copy,
  Search,
  Eye,
} from "lucide-react";
import { AxiosError } from "axios";
import ProductSkeleton from "@/components/skeleton/ProductSkeleton";
import { BulkUploadModal } from "@/components/products/BulkUploadModal";
import { formatVariantLabel } from "@/lib/variantPricing";
import { VariantPricePreview } from "@/components/products/VariantPricePreview";

type Product = {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  discountPercentage: number;
  purchasedQuantity: number;
  stock: number;
  averageRating: number;
  images: string[];
  image: string;
  bg?: string;
  category: {
    _id: string;
    name: string;
  };
  brand: {
    _id: string;
    name: string;
  };
  vendor?: {
    _id: string;
    storeName: string;
  };
  productBase?: {
    _id: string;
    title: string;
  };
  approvalStatus?: "pending" | "approved" | "rejected";
  sizes?: string[];
  colors?: string[];
  weights?: string[];
  productTypes?: string[] | { _id: string; title: string; name: string }[];
  badge?: {
    _id: string;
    name: string;
  };
  createdAt: string;
};

type Category = {
  _id: string;
  name: string;
  level?: number;
  childrenCount?: number;
  productBases?: string[]; // Array of objectIds/strings
  parent?: {
    _id: string;
    name: string;
  } | null;
};

type Brand = {
  _id: string;
  name: string;
  productBase?: string; // string ObjectId
};

type Vendor = {
  _id: string;
  storeName: string;
};

type FormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [availableSizes, setAvailableSizes] = useState<
    { _id: string; name: string; priceModifier?: number }[]
  >([]);
  const [availableColors, setAvailableColors] = useState<
    { _id: string; name: string; priceModifier?: number }[]
  >([]);
  const [availableWeights, setAvailableWeights] = useState<
    { _id: string; name: string; priceModifier?: number }[]
  >([]);

  const [availableProductBases, setAvailableProductBases] = useState<
    { _id: string; title: string }[]
  >([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // Default page = 1
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE); // Default perPage from config
  const [totalPages, setTotalPages] = useState(1); // Track total pages
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Default to ascending
  const [productBaseFilter, setProductBaseFilter] = useState<string>("all"); // Default to all
  const [approvalStatusFilter, setApprovalStatusFilter] =
    useState<string>("all"); // Default to all
  const [vendorFilter, setVendorFilter] = useState<string>("all"); // Default to all
  const [specificVendorFilter, setSpecificVendorFilter] =
    useState<string>("all"); // For specific vendor selection
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();

  // Rich text editor refs and config (shared between add and edit forms)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillAddRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillEditRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeImageHandler =
    (quillRef: React.RefObject<any>) =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();
      input.onchange = () => {
        if (input.files && input.files[0]) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Url = reader.result as string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const quill = (quillRef.current as any)?.getEditor();
            if (quill) {
              const range = quill.getSelection();
              const index = range ? range.index : 0;
              quill.insertEmbed(index, "image", base64Url);
              quill.setSelection(index + 1);
            }
          };
          reader.readAsDataURL(input.files[0]);
        }
      };
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addImageHandler = useCallback(makeImageHandler(quillAddRef), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const editImageHandler = useCallback(makeImageHandler(quillEditRef), []);

  const productQuillModules = (handler: () => void) => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ color: [] }],
        [{ align: [] }],
        ["blockquote"],
        ["link", "image"],
        ["clean"],
      ],
      handlers: { image: handler },
    },
    clipboard: { matchVisual: false },
  });

  const addModules = useMemo(
    () => productQuillModules(addImageHandler),
    [addImageHandler],
  );
  const editModules = useMemo(
    () => productQuillModules(editImageHandler),
    [editImageHandler],
  );

  const quillFormats = [
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
    "blockquote",
    "link",
    "image",
  ];

  // Utility function to extract and upload description images
  const processDescriptionImages = async (
    htmlContent: string,
    productName: string,
  ): Promise<string> => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // Find all images in the HTML
    const images = tempDiv.querySelectorAll("img");

    if (images.length === 0) {
      return htmlContent;
    }

    // Filter base64 images
    const base64Images: { element: HTMLImageElement; src: string }[] = [];
    images.forEach((img) => {
      if (img.src && img.src.startsWith("data:")) {
        base64Images.push({ element: img, src: img.src });
      }
    });

    if (base64Images.length === 0) {
      return htmlContent;
    }

    // Upload each base64 image
    toast({
      title: "Uploading Description Images",
      description: `Uploading ${base64Images.length} image(s) from description...`,
    });

    const sanitizedName = productName
      ? productName
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/(^-|-$)/g, "")
          .toLowerCase()
      : "unnamed";

    for (let i = 0; i < base64Images.length; i++) {
      try {
        const { element, src } = base64Images[i];

        const response = await axiosPrivate.post("/upload/test", {
          image: src,
          folder: `products/${sanitizedName}/description`,
          originalName: `description-${i + 1}.jpg`,
        });

        // Replace the base64 src with the uploaded URL
        element.src = response.data.result.url;
      } catch (error) {
        console.error("Error uploading description image:", error);
        toast({
          variant: "destructive",
          title: "Warning",
          description: `Failed to upload description image ${i + 1}`,
        });
      }
    }

    // Return the modified HTML
    return tempDiv.innerHTML;
  };

  // Note: Image deletion from Cloudinary is now handled exclusively by the backend
  // to prevent race conditions and ensure data consistency.

  // Utility function to clean description HTML (unescape quotes, etc.)
  const cleanDescriptionHtml = (html: string): string => {
    if (!html) return "";
    return html
      .replace(/\\"/g, '"') // Unescape backslash-escaped quotes
      .replace(/\\'/g, "'"); // Unescape single quotes too
  };

  const formAdd = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      discountPercentage: 10,
      purchasedQuantity: 10,
      stock: 10,
      category: "",
      brand: "",
      images: [],
      image: "",
      bg: "#F4F3F5",
      productBase: "",
      productTypes: [],
      sizes: [],
      colors: [],
      weights: [],
      isNewItem: false,
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPercentage: 0,
      purchasedQuantity: 0,
      stock: 0,
      category: "",
      brand: "",
      images: [],
      image: "",
      bg: "#F4F3F5",
      productBase: "",
      productTypes: [],
      sizes: [],
      colors: [],
      weights: [],
      isNewItem: false,
    },
  });

  // Watch for active Product Base in Add and Edit forms to filter dependencies dynamically
  const activeProductBaseAdd = formAdd.watch("productBase");
  const activeProductBaseEdit = formEdit.watch("productBase");

  // Filter Categories internally
  const filteredCategoriesAdd = categories.filter(
    (c) =>
      !activeProductBaseAdd || c.productBases?.includes(activeProductBaseAdd),
  );

  const filteredCategoriesEdit = categories.filter(
    (c) =>
      !activeProductBaseEdit || c.productBases?.includes(activeProductBaseEdit),
  );

  // Filter Brands internally
  const filteredBrandsAdd = brands.filter(
    (b) => !activeProductBaseAdd || b.productBase === activeProductBaseAdd,
  );

  const filteredBrandsEdit = brands.filter(
    (b) => !activeProductBaseEdit || b.productBase === activeProductBaseEdit,
  );

  // Auto-reset dependent fields when productBase changes in Add Form
  useEffect(() => {
    // Only reset if the current category/brand don't match the new product base
    const activeCategory = formAdd.getValues("category");
    const activeBrand = formAdd.getValues("brand");

    if (activeCategory && activeProductBaseAdd) {
      const catMatch = categories.find((c) => c._id === activeCategory);
      if (
        catMatch &&
        catMatch.productBases &&
        !catMatch.productBases.includes(activeProductBaseAdd)
      ) {
        formAdd.setValue("category", "");
      }
    }

    if (activeBrand && activeProductBaseAdd) {
      const brandMatch = brands.find((b) => b._id === activeBrand);
      if (brandMatch && brandMatch.productBase !== activeProductBaseAdd) {
        formAdd.setValue("brand", "");
      }
    }
  }, [activeProductBaseAdd, categories, brands, formAdd]);

  // Auto-reset dependent fields when productBase changes in Edit Form
  // To prevent clearing these fields during initial hydrate step, check if modal is fully open/loaded,
  // or use a flag. For simplicity out of the box we only clear them if they don't map to the current selection.
  useEffect(() => {
    const activeBrand = formEdit.getValues("brand");
    const activeCategory = formEdit.getValues("category");

    // Check if current activeBrand belongs to the new activeProductBaseEdit
    if (activeBrand && activeProductBaseEdit) {
      const brandMatch = brands.find((b) => b._id === activeBrand);
      if (brandMatch && brandMatch.productBase !== activeProductBaseEdit) {
        formEdit.setValue("brand", "");
      }
    }

    // Check if current activeCat belongs to the new activeProductBaseEdit
    if (activeCategory && activeProductBaseEdit) {
      const catMatch = categories.find((c) => c._id === activeCategory);
      if (
        catMatch &&
        catMatch.productBases &&
        !catMatch.productBases.includes(activeProductBaseEdit)
      ) {
        formEdit.setValue("category", "");
      }
    }
  }, [activeProductBaseEdit, categories, brands, formEdit]);

  const fetchProducts = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const params: Record<string, string | number> = {
        page: currentPage,
        perPage,
        sortOrder,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      // Add productBase filter only if not 'all'
      if (productBaseFilter !== "all") {
        params.productBase = productBaseFilter;
      }

      // Add approvalStatus filter only if not 'all'
      if (approvalStatusFilter !== "all") {
        params.approvalStatus = approvalStatusFilter;
      }

      // Add vendor filter only if not 'all'
      if (vendorFilter === "no-vendor") {
        params.vendor = "no-vendor";
      } else if (vendorFilter === "vendor-products") {
        // Show all vendor products, or specific vendor if selected
        if (specificVendorFilter !== "all") {
          params.vendor_id = specificVendorFilter;
        } else {
          params.vendor = "vendor-products";
        }
      } else if (vendorFilter !== "all") {
        params.vendor_id = vendorFilter;
      }

      const response = await axiosPrivate.get("/products", { params });
      setProducts(response.data.products || []);
      setTotal(response.data.total || 0);
      setTotalPages(
        response.data.totalPages ||
          Math.ceil((response.data.total || 0) / perPage),
      );

      // Debug logging

      // If we reset the page, update the page state
      if (resetPage) {
        setPage(1);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const params: Record<string, string | number> = {
        page,
        perPage,
        sortOrder,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      // Add productBase filter only if not 'all'
      if (productBaseFilter !== "all") {
        params.productBase = productBaseFilter;
      }

      // Add approvalStatus filter only if not 'all'
      if (approvalStatusFilter !== "all") {
        params.approvalStatus = approvalStatusFilter;
      }

      // Add vendor filter only if not 'all'
      if (vendorFilter === "no-vendor") {
        params.vendor = "no-vendor";
      } else if (vendorFilter === "vendor-products") {
        // Show all vendor products, or specific vendor ifSelected
        if (specificVendorFilter !== "all") {
          params.vendor_id = specificVendorFilter;
        } else {
          params.vendor = "vendor-products";
        }
      } else if (vendorFilter !== "all") {
        params.vendor_id = vendorFilter;
      }

      const response = await axiosPrivate.get("/products", { params });
      setProducts(response?.data?.products || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(response?.data?.totalPages || 1);
      toast({
        title: "Success",
        description: "Products refreshed successfully",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh products",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosPrivate.get("/categories/admin", {
        params: { page: 1, perPage: 1000, sortOrder: "asc" },
      });
      setCategories(response.data.categories || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories",
      });
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axiosPrivate.get("/brands", {
        params: { page: 1, perPage: 100, sortOrder: "asc" },
      });
      setBrands(response.data.brands || response.data || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load brands",
      });
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axiosPrivate.get("/vendors/requests");
      setVendors(response.data.data || response.data.vendors || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load vendors",
      });
    }
  };

  const fetchAttributes = async () => {
    try {
      const [sizesRes, colorsRes, weightsRes, productBasesRes] =
        await Promise.all([
          axiosPrivate.get("/sizes"),
          axiosPrivate.get("/colors"),
          axiosPrivate.get("/weights"),
          axiosPrivate.get("/product-bases"),
        ]);
      setAvailableSizes(sizesRes.data || []);
      setAvailableColors(colorsRes.data || []);
      setAvailableWeights(weightsRes.data || []);
      setAvailableProductBases(productBasesRes.data || []);
    } catch (error) {
      console.error("Failed to load attributes", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    page,
    sortOrder,
    perPage,
    productBaseFilter,
    approvalStatusFilter,
    vendorFilter,
    specificVendorFilter,
    debouncedSearch,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchVendors();

    fetchAttributes();
  }, []);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);

    formEdit.reset({
      name: product.name,
      slug: product.slug || "",
      description: cleanDescriptionHtml(product.description || ""),
      price: product.price,
      bg: product.bg || "#F4F3F5",
      discountPercentage: product.discountPercentage,
      purchasedQuantity: product.purchasedQuantity || 0,
      stock: product.stock,
      category: product.category._id,
      brand: product.brand._id,
      images: product.images || (product.image ? [product.image] : []),
      image: product.image,
      productBase: product.productBase?._id || "",
      productTypes:
        (product.productTypes as any[])?.map((t) =>
          typeof t === "object" ? t._id : t,
        ) || [],
      sizes:
        (product.sizes as any[])?.map((s) =>
          typeof s === "object" ? s._id : s,
        ) || [],
      colors:
        (product.colors as any[])?.map((c) =>
          typeof c === "object" ? c._id : c,
        ) || [],
      weights:
        (product.weights as any[])?.map((w) =>
          typeof w === "object" ? w._id : w,
        ) || [],
      isNewItem: (product as any).isNewItem || false,
    });
    setIsEditModalOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    formAdd.reset({
      name: `${product.name}-copy`,
      description: cleanDescriptionHtml(product.description || ""),
      slug: product.slug ? `${product.slug}-copy` : "",
      price: product.price,
      bg: product.bg || "#F4F3F5",
      discountPercentage: product.discountPercentage,
      purchasedQuantity: product.purchasedQuantity || 0,
      stock: product.stock,
      category:
        typeof product.category === "object"
          ? product.category._id
          : product.category,
      brand:
        typeof product.brand === "object" ? product.brand._id : product.brand,
      images: product.images || (product.image ? [product.image] : []),
      image: product.image,
      productBase:
        typeof product.productBase === "object"
          ? product.productBase?._id
          : product.productBase || "",
      productTypes:
        (product.productTypes as any[])?.map((t) =>
          typeof t === "object" ? t._id : t,
        ) || [],
      sizes:
        (product.sizes as any[])?.map((s) =>
          typeof s === "object" ? s._id : s,
        ) || [],
      colors:
        (product.colors as any[])?.map((c) =>
          typeof c === "object" ? c._id : c,
        ) || [],
      weights:
        (product.weights as any[])?.map((w) =>
          typeof w === "object" ? w._id : w,
        ) || [],
      isNewItem: false,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleAddProduct = async (data: FormData) => {
    setFormLoading(true);
    try {
      // Process description images first (extract base64 and upload to ImageKit)
      let processedDescription = data.description;
      if (data.description && data.description.includes('src="data:')) {
        processedDescription = await processDescriptionImages(
          data.description,
          data.name,
        );
      }

      // Upload images if they are base64 (deferred upload)
      let uploadedImageUrls = data.images;

      if (data.images.length > 0 && data.images[0].startsWith("data:")) {
        toast({
          title: "Uploading Images",
          description: `Uploading ${data.images.length} image(s)...`,
        });

        const uploadPromises = data.images.map(async (base64Image, index) => {
          try {
            const sanitizedName = data.name
              ? data.name
                  .replace(/[^a-z0-9]+/gi, "-")
                  .replace(/(^-|-$)/g, "")
                  .toLowerCase()
              : "unnamed";
            const response = await axiosPrivate.post("/upload/test", {
              image: base64Image,
              folder: `products/${sanitizedName}`,
              originalName: `${sanitizedName}-${index + 1}.jpg`,
            });
            return response.data.result.url;
          } catch (error) {
            console.error("Error uploading image:", error);
            return null;
          }
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        uploadedImageUrls = uploadedUrls.filter(
          (url): url is string => url !== null,
        );

        if (uploadedImageUrls.length === 0) {
          throw new Error("Failed to upload images");
        }

        if (uploadedImageUrls.length < data.images.length) {
          toast({
            title: "Warning",
            description: `Only ${uploadedImageUrls.length} of ${data.images.length} images uploaded successfully`,
            variant: "destructive",
          });
        }
      }

      await axiosPrivate.post("/products", {
        ...data,
        description: processedDescription,
        images: uploadedImageUrls,
        price: Number(data.price),
        discountPercentage: Number(data.discountPercentage),
        purchasedQuantity: Number(data.purchasedQuantity),
        stock: Number(data.stock),
      });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      formAdd.reset();
      setIsAddModalOpen(false);
      fetchProducts(true); // Reset to page 1 and refetch
    } catch (error: unknown) {
      let errorMessage = "Failed to create product";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (errorMessage.includes("already exists")) {
        formAdd.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast({
          variant: "destructive",
          title: errorMessage.includes("guest user")
            ? "Unauthenticated"
            : "Error",
          description: errorMessage,
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProduct = async (data: FormData) => {
    if (!selectedProduct) return;

    setFormLoading(true);
    try {
      // Process description images first (extract base64 and upload to ImageKit)
      let processedDescription = data.description;
      if (data.description && data.description.includes('src="data:')) {
        processedDescription = await processDescriptionImages(
          data.description,
          data.name,
        );
      }

      // Upload new images if they are base64 (deferred upload)
      let updatedImageUrls = data.images;
      const base64Images = data.images.filter((img) => img.startsWith("data:"));

      if (base64Images.length > 0) {
        toast({
          title: "Uploading Images",
          description: `Uploading ${base64Images.length} new image(s)...`,
        });

        const uploadPromises = base64Images.map(async (base64Image, index) => {
          try {
            const sanitizedName = data.name
              ? data.name
                  .replace(/[^a-z0-9]+/gi, "-")
                  .replace(/(^-|-$)/g, "")
                  .toLowerCase()
              : "unnamed";
            const response = await axiosPrivate.post("/upload/test", {
              image: base64Image,
              folder: `products/${sanitizedName}`,
              originalName: `${sanitizedName}-update-${index + 1}.jpg`,
            });
            return response.data.result.url;
          } catch (error) {
            console.error("Error uploading image:", error);
            return null;
          }
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        const validUploadedUrls = uploadedUrls.filter(
          (url): url is string => url !== null,
        );

        if (validUploadedUrls.length === 0 && base64Images.length > 0) {
          throw new Error("Failed to upload images");
        }

        // Replace base64 images with uploaded URLs
        updatedImageUrls = data.images
          .map((img) => {
            if (img.startsWith("data:")) {
              const index = base64Images.indexOf(img);
              return validUploadedUrls[index] || img;
            }
            return img;
          })
          .filter((url) => !url.startsWith("data:")); // Remove any failed uploads
      }

      // Note: Removed redundant frontend image deletion.
      // Backend handles cleanup of old images during product update.

      await axiosPrivate.put(`/products/${selectedProduct._id}`, {
        ...data,
        description: processedDescription,
        images: updatedImageUrls,
        price: Number(data.price),
        discountPercentage: Number(data.discountPercentage),
        purchasedQuantity: Number(data.purchasedQuantity),
        stock: Number(data.stock),
      });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error: unknown) {
      let errorMessage = "Failed to update product";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (errorMessage.includes("already exists")) {
        formEdit.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast({
          variant: "destructive",
          title: errorMessage.includes("guest user")
            ? "Unauthenticated"
            : "Error",
          description: errorMessage,
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      // Note: Removed redundant frontend image deletion.
      // Backend handles cleanup of all product images during deletion.

      await axiosPrivate.delete(`/products/${selectedProduct._id}`);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchProducts(true); // Reset to page 1 and refetch
    } catch (error: unknown) {
      let errorMessage = "Failed to delete product";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: errorMessage.includes("guest user")
          ? "Unauthenticated"
          : "Error",
        description: errorMessage,
      });
    }
  };

  const handleApproveProduct = async (product: Product) => {
    try {
      await axiosPrivate.put(`/products/${product._id}/approve`, {
        status: "approved",
      });
      toast({
        title: "Success",
        description: "Product approved successfully",
      });
      fetchProducts();
    } catch (error: unknown) {
      let errorMessage = "Failed to approve product";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: errorMessage.includes("guest user")
          ? "Unauthenticated"
          : "Error",
        description: errorMessage,
      });
    }
  };

  const handleRejectProduct = async (product: Product) => {
    try {
      await axiosPrivate.put(`/products/${product._id}/approve`, {
        status: "rejected",
      });
      toast({
        title: "Success",
        description: "Product rejected",
      });
      fetchProducts();
    } catch (error: unknown) {
      let errorMessage = "Failed to reject product";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: errorMessage.includes("guest user")
          ? "Unauthenticated"
          : "Error",
        description: errorMessage,
      });
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages && page * perPage < total) {
      setPage(page + 1);
    }
  };

  const handleSortChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    setPage(1); // Reset to page 1 when sort order changes
  };

  const handlePerPageChange = (value: string) => {
    if (value === "all") {
      setPerPage(total); // Set to total count to show all
    } else {
      setPerPage(parseInt(value));
    }
    setPage(1); // Reset to page 1 when per page changes
  };

  const handleProductBaseFilterChange = (value: string) => {
    setProductBaseFilter(value);
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleApprovalStatusFilterChange = (value: string) => {
    setApprovalStatusFilter(value);
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleVendorFilterChange = (value: string) => {
    setVendorFilter(value);
    setSpecificVendorFilter("all"); // Reset specific vendor when main filter changes
    setPage(1); // Reset to page 1 when filter changes
  };

  const handleSpecificVendorFilterChange = (value: string) => {
    setSpecificVendorFilter(value);
    setPage(1); // Reset to page 1 when filter changes
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:gap-4 rounded-xl border border-border/50 bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6F3F2] p-2 sm:p-2.5 rounded-lg border border-[#E6F3F2]">
              <Badge className="bg-[#088178] text-white hover:bg-[#06665f] border-none">
                Products
              </Badge>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground font-['DM_Sans',sans-serif]">
                Products
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-['DM_Sans',sans-serif]">
                Manage your store catalog
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="hidden lg:flex flex-col bg-[#F8F9FA] px-3 py-1 rounded-md border border-border/50 mr-2 shrink-0">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider font-['DM_Sans',sans-serif]">
                Total
              </span>
              <span className="text-sm font-bold text-foreground font-['DM_Sans',sans-serif] leading-tight text-center">
                {total}
              </span>
            </div>
            {isAdmin && canPerformCRUD && (
              <>
                <Button
                  onClick={() => setIsBulkUploadModalOpen(true)}
                  variant="outline"
                  className="flex-1 sm:flex-none justify-center h-9 border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#495057] font-['DM_Sans',sans-serif] shadow-sm text-sm"
                  title="Bulk Upload"
                >
                  <Upload className="mr-2 h-4 w-4 text-[#6C757D]" />
                  <span className="hidden sm:inline">Bulk</span>
                </Button>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-1 sm:flex-none justify-center h-9 bg-primary-main hover:bg-primary-main/90 text-white shadow-sm font-['DM_Sans',sans-serif] text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add Product</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between mt-2">
          <div className="relative w-full xl:w-72 lg:max-w-md shrink-0 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary-main transition-colors" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-full bg-[#F8F9FA] border-[#E9ECEF] focus-visible:ring-primary-main/20 focus-visible:border-primary-main transition-all font-['DM_Sans',sans-serif] text-sm shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-9 w-9 bg-white border-[#E9ECEF] hover:bg-[#F8F9FA] text-[#495057] shrink-0 shadow-sm"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin text-primary-main" : ""}`}
              />
            </Button>

            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger className="h-9 w-auto sm:w-[130px] bg-white border-[#E9ECEF] font-['DM_Sans',sans-serif] text-xs sm:text-sm shrink-0 shadow-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={perPage >= total && total > 0 ? "all" : perPage.toString()}
              onValueChange={handlePerPageChange}
            >
              <SelectTrigger className="h-9 w-auto sm:w-[110px] bg-white border-[#E9ECEF] font-['DM_Sans',sans-serif] text-xs sm:text-sm shrink-0 shadow-sm">
                <SelectValue placeholder="Per Page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={approvalStatusFilter}
              onValueChange={handleApprovalStatusFilterChange}
            >
              <SelectTrigger className="h-9 w-auto sm:w-[130px] bg-white border-[#E9ECEF] font-['DM_Sans',sans-serif] text-xs sm:text-sm shrink-0 shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={productBaseFilter}
              onValueChange={handleProductBaseFilterChange}
            >
              <SelectTrigger className="h-9 w-auto sm:w-[140px] bg-white border-[#E9ECEF] font-['DM_Sans',sans-serif] text-xs sm:text-sm shrink-0 shadow-sm">
                <SelectValue placeholder="Base Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bases</SelectItem>
                {availableProductBases.map((base) => (
                  <SelectItem key={base._id} value={base._id}>
                    {base.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={vendorFilter}
              onValueChange={handleVendorFilterChange}
            >
              <SelectTrigger className="h-9 w-auto sm:w-[145px] bg-white border-[#E9ECEF] font-['DM_Sans',sans-serif] text-xs sm:text-sm shrink-0 shadow-sm">
                <SelectValue placeholder="Vendor Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="no-vendor">Admin Products</SelectItem>
                <SelectItem value="vendor-products">Vendor Products</SelectItem>
              </SelectContent>
            </Select>

            {vendorFilter === "vendor-products" && vendors.length > 0 && (
              <Select
                value={specificVendorFilter}
                onValueChange={handleSpecificVendorFilterChange}
              >
                <SelectTrigger className="h-9 w-auto sm:w-[145px] bg-white border-[#E9ECEF] font-['DM_Sans',sans-serif] text-xs sm:text-sm shrink-0 shadow-sm">
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor._id} value={vendor._id}>
                      {vendor.storeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {isAdmin && isReadOnly && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-warning-lighter dark:bg-warning-darker/20 border border-warning-lighter dark:border-warning-dark rounded-md text-xs sm:text-sm">
            <span className="text-warning-dark dark:text-warning-main">
              👁️ Read-only mode: You can view all data but cannot make changes
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <ProductSkeleton isAdmin={isAdmin} />
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden lg:block rounded-lg border border-border/50 shadow-sm bg-card overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-b border-border/50 bg-[#F8F9FA] hover:bg-[#F8F9FA]">
                    <TableHead className="font-semibold whitespace-nowrap font-['DM_Sans',sans-serif] text-sm text-[#495057] uppercase py-3 border-b border-border/50">
                      Product
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap font-['DM_Sans',sans-serif] text-sm text-[#495057] uppercase py-3 border-b border-border/50">
                      Category
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap font-['DM_Sans',sans-serif] text-sm text-[#495057] uppercase py-3 border-b border-border/50">
                      Price
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap font-['DM_Sans',sans-serif] text-sm text-[#495057] uppercase py-3 border-b border-border/50">
                      Inventory
                    </TableHead>
                    <TableHead className="font-semibold whitespace-nowrap font-['DM_Sans',sans-serif] text-sm text-[#495057] uppercase py-3 border-b border-border/50">
                      Seller
                    </TableHead>
                    {isAdmin && (
                      <TableHead className="text-right font-semibold whitespace-nowrap font-['DM_Sans',sans-serif] text-sm text-[#495057] uppercase py-3 border-b border-border/50">
                        Action
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow
                      key={product._id}
                      className={`border-b border-border/30 transition-colors hover:bg-muted/50 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }`}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center">
                          {product?.images && product.images.length > 0 ? (
                            <>
                              {product.images.slice(0, 3).map((img, i) => (
                                <div
                                  key={i}
                                  className={`h-10 w-10 rounded-full overflow-hidden bg-muted shadow-sm border shrink-0 ${
                                    i > 0 ? "-ml-3" : ""
                                  } ring-2 ring-white relative z-${30 - i * 10}`}
                                >
                                  <img
                                    src={img}
                                    alt={`${product?.name} image ${i + 1}`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      const currentSrc = target.src;
                                      if (
                                        currentSrc.includes(
                                          "/placeholder-image.jpg",
                                        )
                                      )
                                        return;
                                      if (
                                        currentSrc.includes("cloudinary.com") &&
                                        !target.dataset.retryCount
                                      ) {
                                        target.dataset.retryCount = "1";
                                        setTimeout(() => {
                                          target.src = `${currentSrc}${currentSrc.includes("?") ? "&" : "?"}retry=${Date.now()}`;
                                        }, 2000);
                                      } else if (
                                        target.dataset.retryCount === "1"
                                      ) {
                                        target.dataset.retryCount = "2";
                                        setTimeout(() => {
                                          target.src = `${currentSrc.split("retry=")[0]}retry=${Date.now()}`;
                                        }, 5000);
                                      } else {
                                        target.src = "/placeholder-image.jpg";
                                      }
                                    }}
                                  />
                                </div>
                              ))}
                              {product.images.length > 3 && (
                                <div className="flex -ml-3 h-10 w-10 items-center justify-center rounded-full bg-[#F8F9FA] border border-[#E9ECEF] text-xs font-bold text-gray-600 shrink-0 ring-2 ring-white z-0 overflow-hidden font-['DM_Sans',sans-serif]">
                                  +{product.images.length - 3}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted shadow-sm border shrink-0 ring-2 ring-white relative">
                              <img
                                src={product?.image || "/placeholder-image.jpg"}
                                alt={product?.name || "Placeholder"}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    "/placeholder-image.jpg";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground py-3">
                        <div className="flex flex-col">
                          <span
                            className="max-w-[150px] sm:max-w-xs truncate text-[#212529] font-semibold font-['DM_Sans',sans-serif] text-sm"
                            title={product?.name}
                          >
                            {product?.name}
                          </span>
                          <span className="text-xs text-[#6C757D] font-['Outfit',sans-serif] capitalize truncate max-w-[150px] sm:max-w-xs">
                            {product?.productBase?.title || "Base"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="inline-flex items-center rounded-full bg-info-lighter px-2 py-0.5 text-[11px] font-medium text-info-dark whitespace-nowrap max-w-40 truncate">
                          {product?.category?.name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-[#212529] font-['DM_Sans',sans-serif] text-sm whitespace-nowrap py-3">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${
                              product.stock > 10
                                ? "bg-success-lighter text-success-dark"
                                : product.stock > 0
                                  ? "bg-warning-lighter text-warning-dark"
                                  : "bg-error-lighter text-error-dark"
                            }`}
                          >
                            {product.stock} in stock
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {product?.vendor ? (
                          <span className="inline-flex items-center rounded-sm bg-cyan-100 px-2 py-0.5 text-[11px] font-medium text-cyan-800 whitespace-nowrap max-w-40 truncate">
                            {product.vendor.storeName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-sm bg-grey-100 px-2 py-0.5 text-[11px] font-medium text-grey-600 whitespace-nowrap">
                            Admin
                          </span>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                              className="h-8 w-8 hover:bg-info-lighter hover:text-info-main shrink-0"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicate(product)}
                              className="h-8 w-8 hover:bg-success-lighter hover:text-success-main shrink-0"
                              title="Duplicate product"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product)}
                              className="h-8 w-8 hover:bg-error-lighter hover:text-error-main shrink-0"
                              title="Delete product"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            {canPerformCRUD &&
                              product.approvalStatus === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleApproveProduct(product)
                                    }
                                    className="h-8 w-8 hover:bg-success-lighter hover:text-success-main shrink-0"
                                    title="Approve product"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRejectProduct(product)}
                                    className="h-8 w-8 hover:bg-error-lighter hover:text-error-main shrink-0"
                                    title="Reject product"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 11 : 10}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">No products found</p>
                            <p className="text-sm">
                              Start by adding your first product
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Card View - Visible only on mobile/tablet */}
          <div className="lg:hidden space-y-4">
            {products.length === 0 ? (
              <div className="rounded-lg border border-border/50 bg-card p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">No products found</p>
                    <p className="text-sm text-muted-foreground">
                      Start by adding your first product
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  className="rounded-lg border border-border/50 bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-md overflow-hidden bg-muted shadow-sm border shrink-0">
                      <img
                        src={product?.images?.[0] || product?.image}
                        alt={product?.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const currentSrc = target.src;

                          if (currentSrc.includes("/placeholder-image.jpg")) {
                            return;
                          }

                          // Retry logic for Cloudinary 404s (likely propagation delay)
                          if (
                            currentSrc.includes("cloudinary.com") &&
                            !target.dataset.retryCount
                          ) {
                            target.dataset.retryCount = "1";
                            setTimeout(() => {
                              target.src = `${currentSrc}${currentSrc.includes("?") ? "&" : "?"}retry=${Date.now()}`;
                            }, 2000);
                          } else if (target.dataset.retryCount === "1") {
                            target.dataset.retryCount = "2";
                            setTimeout(() => {
                              target.src = `${currentSrc.split("retry=")[0]}retry=${Date.now()}`;
                            }, 5000);
                          } else {
                            target.src = "/placeholder-image.jpg";
                          }
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                          {product.name}
                        </h3>
                        {isAdmin && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                              className="h-8 w-8 hover:bg-info-lighter hover:text-info-main"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicate(product)}
                              className="h-8 w-8 hover:bg-success-lighter hover:text-success-main"
                              title="Duplicate product"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product)}
                              className="h-8 w-8 hover:bg-error-lighter hover:text-error-main"
                              title="Delete product"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            {canPerformCRUD &&
                              product.approvalStatus === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleApproveProduct(product)
                                    }
                                    className="h-8 w-8 hover:bg-success-lighter hover:text-success-main"
                                    title="Approve product"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRejectProduct(product)}
                                    className="h-8 w-8 hover:bg-error-lighter hover:text-error-main"
                                    title="Reject product"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                          </div>
                        )}
                      </div>

                      {/* Price and Rating */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-success-main text-lg">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                          {product.discountPercentage}% off
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-warning-main">★</span>
                          <span className="font-medium text-sm">
                            {product.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Category, Brand, Stock */}
                      <div className="flex flex-wrap gap-2">
                        {product?.slug ? (
                          <Badge
                            variant="outline"
                            className="bg-success-lighter text-success-dark border-success-lighter"
                          >
                            Set
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-error-lighter text-error-dark border-error-lighter"
                          >
                            Not Set
                          </Badge>
                        )}
                        <span className="inline-flex items-center rounded-full bg-info-lighter px-2 py-1 text-xs font-medium text-info-dark">
                          {product?.category?.name}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                          {product?.brand?.name}
                        </span>
                        {product?.vendor ? (
                          <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-800">
                            {product.vendor.storeName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-grey-100 px-2 py-1 text-xs font-medium text-grey-600">
                            Admin
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-info-lighter px-2 py-1 text-xs font-medium text-info-dark">
                          Base: {product.purchasedQuantity || 0}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                          Sold:{" "}
                          {Math.max(
                            (product.purchasedQuantity || 0) - product.stock,
                            0,
                          )}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            product.stock > 10
                              ? "bg-success-lighter text-success-dark"
                              : product.stock > 0
                                ? "bg-warning-lighter text-warning-dark"
                                : "bg-error-lighter text-error-dark"
                          }`}
                        >
                          Stock: {product.stock}
                        </span>
                        {product?.productBase ? (
                          <span className="inline-flex items-center rounded-full bg-info-lighter px-2 py-1 text-xs font-medium text-info-dark capitalize">
                            {product.productBase.title}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-grey-100 px-2 py-1 text-xs font-medium text-grey-600">
                            Base
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${
                            product?.approvalStatus === "approved"
                              ? "bg-success-lighter text-success-dark"
                              : product?.approvalStatus === "rejected"
                                ? "bg-error-lighter text-error-dark"
                                : "bg-warning-lighter text-warning-dark"
                          }`}
                        >
                          {product?.approvalStatus || "approved"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {total > perPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-card rounded-lg border border-border/50 px-3 sm:px-4 py-3 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium">
                    {(page - 1) * perPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * perPage, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> products
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="disabled:opacity-50 text-xs sm:text-sm"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page >= totalPages || page * perPage >= total}
                  className="disabled:opacity-50 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Simple pagination for single page */}
          {total > 0 && total <= perPage && (
            <div className="text-center text-xs sm:text-sm text-muted-foreground bg-card rounded-lg border border-border/50 px-4 py-3">
              Showing all <span className="font-medium">{total}</span> products
            </div>
          )}
        </>
      )}

      {/* Add Product Sidebar */}
      <Sheet
        open={isAddModalOpen}
        onOpenChange={(open) => {
          if (!open && formLoading) {
            toast({
              title: "Upload in Progress",
              description: "Please wait while the product is being created...",
              variant: "destructive",
            });
            return;
          }
          setIsAddModalOpen(open);
        }}
      >
        <SheetContent className="w-full sm:max-w-150 overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl sm:text-2xl">Add Product</SheetTitle>
            <SheetDescription className="text-sm">
              Create a new product
            </SheetDescription>
          </SheetHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddProduct)}
              className="space-y-3 sm:space-y-4 mt-4 sm:mt-6"
            >
              <FormField<FormData>
                control={formAdd.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<FormData>
                control={formAdd.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug (URL-friendly version)
                      <span className="text-xs text-muted-foreground ml-2">
                        Optional - Auto-generated if left empty
                      </span>
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          disabled={formLoading}
                          placeholder="e.g., baby-bear-outfit-clothing"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const name = formAdd.getValues("name");
                          if (name) {
                            const slug = name
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-+|-+$/g, "");
                            formAdd.setValue("slug", slug);
                          }
                        }}
                        disabled={formLoading || !formAdd.watch("name")}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<FormData>
                control={formAdd.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="rounded-md border border-input overflow-hidden [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-input [&_.ql-toolbar]:bg-muted/30 [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:border-0 [&_.ql-container]:min-h-[220px] [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed">
                        <ReactQuill
                          ref={quillAddRef}
                          theme="snow"
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                          modules={addModules}
                          formats={quillFormats}
                          readOnly={formLoading}
                          placeholder="Write a detailed product description..."
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField<FormData>
                  control={formAdd.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          placeholder="0"
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseFloat(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          placeholder="0"
                          type="number"
                          min="0"
                          max="100"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseFloat(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField<FormData>
                  control={formAdd.control}
                  name="purchasedQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Qty</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          placeholder="0"
                          type="number"
                          min="0"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseInt(e.target.value, 10),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          placeholder="0"
                          type="number"
                          min="0"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseInt(e.target.value, 10),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="isNewItem"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-10 shadow-sm mt-8">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-muted-foreground">
                          New Arrival Badge
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                          disabled={formLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="productBase"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Product Base</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value as string}
                        value={field.value as string}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product base" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {availableProductBases.map((base) => (
                            <SelectItem key={base._id} value={base._id}>
                              {base.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <NestedCategorySelector
                          categories={filteredCategoriesAdd}
                          value={field.value as string}
                          onValueChange={field.onChange}
                          disabled={formLoading || !activeProductBaseAdd}
                          placeholder="Select a category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formAdd.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value as string}
                        value={field.value as string}
                        disabled={formLoading || !activeProductBaseAdd}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredBrandsAdd.map((brand) => (
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
              </div>
              <FormField<FormData>
                control={formAdd.control}
                name="productTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Types (Optional)</FormLabel>
                    <FormControl>
                      <AsyncProductTypeSelect
                        value={(field.value as string[]) || []}
                        onChange={field.onChange}
                        productBase={formAdd.watch("productBase") || ""}
                        disabled={formLoading || !formAdd.watch("productBase")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<FormData>
                control={formAdd.control}
                name="bg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color Hex (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input
                          {...field}
                          type="color"
                          className="w-12 h-10 p-1 cursor-pointer"
                          disabled={formLoading}
                        />
                        <Input
                          {...field}
                          type="text"
                          placeholder="#F4F3F5"
                          className="flex-1 uppercase font-mono"
                          disabled={formLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField<FormData>
                  control={formAdd.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Sizes</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            const allIds = availableSizes.map((s) => s._id);
                            const currentSelected =
                              (field.value as string[]) || [];
                            if (currentSelected.length === allIds.length) {
                              formAdd.setValue("sizes", []);
                            } else {
                              formAdd.setValue("sizes", allIds);
                            }
                          }}
                        >
                          {((field.value as string[]) || []).length ===
                          availableSizes.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <FormControl>
                        <MultiSelect
                          options={availableSizes.map((s) => ({
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
                <FormField<FormData>
                  control={formAdd.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Colors</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            const allIds = availableColors.map((c) => c._id);
                            const currentSelected =
                              (field.value as string[]) || [];
                            if (currentSelected.length === allIds.length) {
                              formAdd.setValue("colors", []);
                            } else {
                              formAdd.setValue("colors", allIds);
                            }
                          }}
                        >
                          {((field.value as string[]) || []).length ===
                          availableColors.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <FormControl>
                        <MultiSelect
                          options={availableColors.map((c) => ({
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
                <FormField<FormData>
                  control={formAdd.control}
                  name="weights"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Weights</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            const allIds = availableWeights.map((w) => w._id);
                            const currentSelected =
                              (field.value as string[]) || [];
                            if (currentSelected.length === allIds.length) {
                              formAdd.setValue("weights", []);
                            } else {
                              formAdd.setValue("weights", allIds);
                            }
                          }}
                        >
                          {((field.value as string[]) || []).length ===
                          availableWeights.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <FormControl>
                        <MultiSelect
                          options={availableWeights.map((w) => ({
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
                basePrice={Number(formAdd.watch("price")) || 0}
                discountPercentage={Number(formAdd.watch("discountPercentage")) || 0}
                selectedSizes={(formAdd.watch("sizes") as string[]) || []}
                selectedColors={(formAdd.watch("colors") as string[]) || []}
                selectedWeights={(formAdd.watch("weights") as string[]) || []}
                sizes={availableSizes}
                colors={availableColors}
                weights={availableWeights}
              />

              <FormField<FormData>
                control={formAdd.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                      <MultiImageUpload
                        value={(field.value as string[]) || []}
                        onChange={field.onChange}
                        maxImages={
                          parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES) || 6
                        }
                        disabled={formLoading}
                        deferUpload={true}
                        disableServerDelete={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="gap-2 flex-col sm:flex-row mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="w-full sm:w-auto"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Edit Product Sidebar */}
      <Sheet
        open={isEditModalOpen}
        onOpenChange={(open) => {
          if (!open && formLoading) {
            toast({
              title: "Update in Progress",
              description: "Please wait while the product is being updated...",
              variant: "destructive",
            });
            return;
          }
          setIsEditModalOpen(open);
        }}
      >
        <SheetContent className="w-full sm:max-w-150 overflow-y-auto p-4 sm:p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl sm:text-2xl">
              Edit Product
            </SheetTitle>
            <SheetDescription className="text-sm">
              Update product information
            </SheetDescription>
          </SheetHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateProduct)}
              className="space-y-3 sm:space-y-4 mt-4 sm:mt-6"
            >
              <FormField<FormData>
                control={formEdit.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<FormData>
                control={formEdit.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Slug (URL-friendly version)
                      <span className="text-xs text-muted-foreground ml-2">
                        Optional - Auto-generated if left empty
                      </span>
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          disabled={formLoading}
                          placeholder="e.g., baby-bear-outfit-clothing"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const name = formEdit.getValues("name");
                          if (name) {
                            const slug = name
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-+|-+$/g, "");
                            formEdit.setValue("slug", slug);
                          }
                        }}
                        disabled={formLoading || !formEdit.watch("name")}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<FormData>
                control={formEdit.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="rounded-md border border-input overflow-hidden [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-input [&_.ql-toolbar]:bg-muted/30 [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:border-0 [&_.ql-container]:min-h-[220px] [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed">
                        <ReactQuill
                          ref={quillEditRef}
                          theme="snow"
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                          modules={editModules}
                          formats={quillFormats}
                          readOnly={formLoading}
                          placeholder="Write a detailed product description..."
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField<FormData>
                  control={formEdit.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          placeholder="0"
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseFloat(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          placeholder="0"
                          type="number"
                          min="0"
                          max="100"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseFloat(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField<FormData>
                  control={formEdit.control}
                  name="purchasedQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Qty</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          placeholder="0"
                          type="number"
                          min="0"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseInt(e.target.value, 10),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value === 0 ? "" : field.value}
                          placeholder="0"
                          type="number"
                          min="0"
                          disabled={formLoading}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseInt(e.target.value, 10),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="isNewItem"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-10 shadow-sm mt-8">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-muted-foreground">
                          New Arrival Badge
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                          disabled={formLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="productBase"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Product Base</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value as string}
                        value={field.value as string}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product base" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {availableProductBases.map((base) => (
                            <SelectItem key={base._id} value={base._id}>
                              {base.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <NestedCategorySelector
                          categories={filteredCategoriesEdit}
                          value={field.value as string}
                          onValueChange={field.onChange}
                          disabled={formLoading || !activeProductBaseEdit}
                          placeholder="Select a category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField<FormData>
                  control={formEdit.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value as string}
                        disabled={formLoading || !activeProductBaseEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredBrandsEdit.map((brand) => (
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
              </div>
              <FormField<FormData>
                control={formEdit.control}
                name="productTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Types (Optional)</FormLabel>
                    <FormControl>
                      <AsyncProductTypeSelect
                        value={(field.value as string[]) || []}
                        onChange={field.onChange}
                        productBase={formEdit.watch("productBase") || ""}
                        disabled={formLoading || !formEdit.watch("productBase")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField<FormData>
                control={formEdit.control}
                name="bg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color Hex (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input
                          {...field}
                          type="color"
                          className="w-12 h-10 p-1 cursor-pointer"
                          disabled={formLoading}
                        />
                        <Input
                          {...field}
                          type="text"
                          placeholder="#F4F3F5"
                          className="flex-1 uppercase font-mono"
                          disabled={formLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField<FormData>
                  control={formEdit.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Sizes</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            const allIds = availableSizes.map((s) => s._id);
                            const currentSelected =
                              (field.value as string[]) || [];
                            if (currentSelected.length === allIds.length) {
                              formEdit.setValue("sizes", []);
                            } else {
                              formEdit.setValue("sizes", allIds);
                            }
                          }}
                        >
                          {((field.value as string[]) || []).length ===
                          availableSizes.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <FormControl>
                        <MultiSelect
                          options={availableSizes.map((s) => ({
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
                <FormField<FormData>
                  control={formEdit.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Colors</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            const allIds = availableColors.map((c) => c._id);
                            const currentSelected =
                              (field.value as string[]) || [];
                            if (currentSelected.length === allIds.length) {
                              formEdit.setValue("colors", []);
                            } else {
                              formEdit.setValue("colors", allIds);
                            }
                          }}
                        >
                          {((field.value as string[]) || []).length ===
                          availableColors.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <FormControl>
                        <MultiSelect
                          options={availableColors.map((c) => ({
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
                <FormField<FormData>
                  control={formEdit.control}
                  name="weights"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Weights</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            const allIds = availableWeights.map((w) => w._id);
                            const currentSelected =
                              (field.value as string[]) || [];
                            if (currentSelected.length === allIds.length) {
                              formEdit.setValue("weights", []);
                            } else {
                              formEdit.setValue("weights", allIds);
                            }
                          }}
                        >
                          {((field.value as string[]) || []).length ===
                          availableWeights.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <FormControl>
                        <MultiSelect
                          options={availableWeights.map((w) => ({
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
                basePrice={Number(formEdit.watch("price")) || 0}
                discountPercentage={
                  Number(formEdit.watch("discountPercentage")) || 0
                }
                selectedSizes={(formEdit.watch("sizes") as string[]) || []}
                selectedColors={(formEdit.watch("colors") as string[]) || []}
                selectedWeights={(formEdit.watch("weights") as string[]) || []}
                sizes={availableSizes}
                colors={availableColors}
                weights={availableWeights}
              />
              <FormField<FormData>
                control={formEdit.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                      <MultiImageUpload
                        value={(field.value as string[]) || []}
                        onChange={field.onChange}
                        maxImages={
                          parseInt(import.meta.env.VITE_MAX_PRODUCT_IMAGES) || 6
                        }
                        disabled={formLoading}
                        deferUpload={true}
                        disableServerDelete={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="gap-2 flex-col sm:flex-row mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="w-full sm:w-auto"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Product"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Product Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete the
              product{" "}
              <span className="font-semibold">{selectedProduct?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={isBulkUploadModalOpen}
        onOpenChange={setIsBulkUploadModalOpen}
        categories={categories}
        brands={brands}
        onSuccess={() => {
          fetchProducts(true); // Refresh products after bulk upload
        }}
      />
    </div>
  );
}
