import { useState, useEffect, useMemo, useRef } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { productTypeSchema } from "@/lib/validation";
import { DEFAULT_PER_PAGE } from "@/lib/pagination";
import { motion } from "framer-motion";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tag,
  Plus,
  RefreshCw,
  Search,
  Filter,
  X,
  Edit,
  Trash,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
  BarChart2,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ProductType = {
  _id: string;
  name: string;
  slug: string;
  title?: string;
  description?: string;
  banner?: string;
  bannerImages?: string[];
  isActive: boolean;
  displayOrder: number;
  bgColor?: string;
  productBasesBg?: Record<string, string>;
  bannerPages?: string[];
  productBases?: string[];
  createdAt: string;
};

type BannerPage = {
  _id: string;
  name: string;
  slug: string;
};

type ProductBase = {
  _id: string;
  title: string;
  slug: string;
};

type FormData = {
  name: string;
  slug?: string;
  title?: string;
  description?: string;
  banner?: string | File;
  bannerImages?: (string | File)[];
  isActive: boolean;
  displayOrder: number;
  bgColor: string;
  productBasesBg?: Record<string, string>;
  bannerPages?: string[];
  productBases?: string[];
};

type ProductTypeResponse = {
  productTypes: ProductType[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export default function ProductTypesPage() {
  // Data state
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [availableBannerPages, setAvailableBannerPages] = useState<
    BannerPage[]
  >([]);
  const [availableProductBases, setAvailableProductBases] = useState<
    ProductBase[]
  >([]);

  // Sheet state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductType, setSelectedProductType] =
    useState<ProductType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Active ProductBase tab filter (client-side)
  const [activeBaseTab, setActiveBaseTab] = useState("all");

  // Collapsible panels
  const [showStats, setShowStats] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();

  // Single form for both add and edit
  const form = useForm<FormData>({
    resolver: zodResolver(productTypeSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      title: "",
      description: "",
      banner: "",
      bannerImages: [],
      isActive: true,
      displayOrder: 0,
      bgColor: "#ffffff",
      productBasesBg: {},
      bannerPages: [],
      productBases: [],
    },
  });

  // Fetch product bases
  const fetchProductBases = async () => {
    try {
      const response = await axiosPrivate.get("/product-bases");
      if (Array.isArray(response.data)) {
        setAvailableProductBases(response.data);
      }
    } catch (error) {
      console.error("Failed to load product bases", error);
    }
  };

  // Fetch active banner pages
  const fetchBannerPages = async () => {
    try {
      const response = await axiosPrivate.get("/banner-pages");
      // If the response is the expected array, set it
      if (Array.isArray(response.data)) {
        setAvailableBannerPages(response.data);
      } else if (response.data && Array.isArray(response.data.bannerPages)) {
        setAvailableBannerPages(response.data.bannerPages);
      }
    } catch (error) {
      console.error("Failed to load banner pages", error);
    }
  };

  // Enhanced fetch function with pagination and filters
  const fetchProductTypes = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(activeFilter !== "all" && { isActive: activeFilter }),
      });

      const response = await axiosPrivate.get<ProductTypeResponse>(
        `/product-types/admin?${params}`,
      );
      const {
        productTypes: fetchedProductTypes,
        total,
        totalPages,
      } = response.data;

      setProductTypes(fetchedProductTypes);
      setTotal(total);
      setTotalPages(totalPages);
      setCurrentPage(page);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Product types refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load product types", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product types",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Track previous filters to avoid double fetching on mount and in StrictMode
  const prevFilters = useRef({ searchTerm, sortOrder, perPage, activeFilter });

  // Debounced filter and search effect
  useEffect(() => {
    const changed =
      prevFilters.current.searchTerm !== searchTerm ||
      prevFilters.current.sortOrder !== sortOrder ||
      prevFilters.current.perPage !== perPage ||
      prevFilters.current.activeFilter !== activeFilter;

    if (!changed) {
      return;
    }

    // Update ref to latest
    prevFilters.current = { searchTerm, sortOrder, perPage, activeFilter };

    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchProductTypes(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, sortOrder, perPage, activeFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSortOrder("desc");
    setActiveFilter("");
    setCurrentPage(1);
    setPerPage(10);
  };

  const handleRefresh = () => {
    fetchProductTypes(currentPage, true);
  };

  useEffect(() => {
    fetchProductTypes(1);
    fetchBannerPages();
    fetchProductBases();
  }, []);

  // Initial fetch is already handled by the empty dependency array useEffect.
  // We no longer need the weird useMemo debounce hook here!

  const handleEdit = (productType: ProductType) => {
    setSelectedProductType(productType);
    setIsEditMode(true);
    form.reset({
      name: productType.name,
      slug: productType.slug || "",

      title: productType.title || "",
      description: productType.description || "",
      banner: productType.banner || "",
      bannerImages: productType.bannerImages || [],
      isActive: productType.isActive,
      displayOrder: productType.displayOrder,
      bgColor: productType.bgColor || "#ffffff",
      productBasesBg: productType.productBasesBg || {},
      bannerPages: productType.bannerPages || [],
      productBases: productType.productBases || [],
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedProductType(null);
    setIsEditMode(false);
    form.reset({
      name: "",
      slug: "",
      title: "",
      description: "",
      banner: "",
      bannerImages: [],
      isActive: true,
      displayOrder: 0,
      bgColor: "#ffffff",
      productBasesBg: {},
      bannerPages: [],
      productBases: [],
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (productType: ProductType) => {
    setSelectedProductType(productType);
    setIsDeleteModalOpen(true);
  };

  // Duplicate: pre-fill add form with existing values, append -copy
  const handleDuplicate = (productType: ProductType) => {
    setSelectedProductType(null);
    setIsEditMode(false);
    form.reset({
      name: `${productType.name}-copy`,
      slug: `${productType.slug}-copy`,
      title: productType.title || "",
      description: productType.description || "",
      banner: productType.banner || "",
      bannerImages: productType.bannerImages || [],
      isActive: productType.isActive,
      displayOrder: productType.displayOrder,
      bgColor: productType.bgColor || "#ffffff",
      productBasesBg: productType.productBasesBg || {},
      bannerPages: productType.bannerPages || [],
      productBases: productType.productBases || [],
    });
    setIsSidebarOpen(true);
  };

  const handleSubmit = async (values: FormData) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedProductType) {
        // Update existing product type
        await axiosPrivate.put(
          `/product-types/${selectedProductType._id}`,
          values,
        );
        toast({
          title: "Success",
          description: "Product type updated successfully",
        });
        fetchProductTypes(currentPage); // Stay on current page
      } else {
        // Create new product type
        await axiosPrivate.post("/product-types", values);
        toast({
          title: "Success",
          description: "Product type created successfully",
        });
        fetchProductTypes(1); // Reset to first page
      }
      form.reset();
      setIsSidebarOpen(false);
    } catch (error: any) {
      console.error("Failed to save product type", error);
      let errorMessage = `Failed to ${isEditMode ? "update" : "create"} product type`;

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProductType = async () => {
    if (!selectedProductType) return;

    try {
      await axiosPrivate.delete(`/product-types/${selectedProductType._id}`);
      toast({
        title: "Success",
        description: "Product type deleted successfully",
      });
      setIsDeleteModalOpen(false);

      // Smart pagination after delete
      const newTotal = total - 1;
      const newTotalPages = Math.ceil(newTotal / perPage);
      const targetPage =
        currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;

      fetchProductTypes(targetPage);
    } catch (error) {
      console.error("Failed to delete product type", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product type",
      });
    }
  };

  // Compute displayed product types based on active base tab (client-side filter)
  const displayedTypes = useMemo(() => {
    if (activeBaseTab === "all") return productTypes;
    return productTypes.filter((pt) =>
      pt.productBases?.includes(activeBaseTab),
    );
  }, [productTypes, activeBaseTab]);

  // Skeleton loading component
  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 px-2.5 py-0.5 rounded-full" />
      </TableCell>
      <TableCell>
        <div className="flex flex-row items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-12 rounded-sm" />
          <Skeleton className="h-4 w-12 rounded-sm" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-14 rounded-sm" />
          <Skeleton className="h-4 w-10 rounded-sm" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-6" />
      </TableCell>
      {isAdmin && (
        <TableCell>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md bg-muted/60" />
            <Skeleton className="h-8 w-8 rounded-md bg-muted/60" />
            <Skeleton className="h-8 w-8 rounded-md bg-muted/60" />
          </div>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Types</h1>
          <p className="text-muted-foreground">
            Manage product classification types
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Stats toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowStats((v) => !v)}
            title={showStats ? "Hide stats" : "Show stats"}
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
          {/* Filter/search toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSearchPanel((v) => !v)}
            title={showSearchPanel ? "Hide filters" : "Show filters"}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {isAdmin && canPerformCRUD && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Product Type
            </Button>
          )}
          {isAdmin && isReadOnly && (
            <div className="flex items-center gap-2 px-3 py-2 bg-warning-lighter  border border-warning-lighter  rounded-md">
              <span className="text-xs text-warning-dark ">
                👁️ Read-only mode
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Compact Stats Row — collapsed by default */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-3 overflow-x-auto pb-2"
        >
          <Card className="flex-1 min-w-[140px] shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Total Types
                </p>
                <div className="text-lg font-bold">
                  {loading ? <Skeleton className="h-6 w-12" /> : total}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[140px] shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-info-main/10 rounded-lg">
                <Filter className="h-4 w-4 text-info-main" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Current Page
                </p>
                <div className="text-lg font-bold">
                  {loading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    `${currentPage}/${totalPages}`
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[140px] shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <RefreshCw className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Per Page
                </p>
                <div className="text-lg font-bold">
                  {loading ? <Skeleton className="h-6 w-10" /> : perPage}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search & Filters — collapsed by default */}
      {showSearchPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardContent className="space-y-4 pt-4">
              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name, type, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={
                    !searchTerm && sortOrder === "desc" && !activeFilter
                  }
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? (
                    <ChevronUp className="mr-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className="mr-1 h-4 w-4" />
                  )}
                  {showFilters ? "Less" : "More filters"}
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t"
                >
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sort Order
                    </label>
                    <Select
                      value={sortOrder}
                      onValueChange={(value: "asc" | "desc") =>
                        setSortOrder(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Status
                    </label>
                    <Select
                      value={activeFilter}
                      onValueChange={setActiveFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Items Per Page
                    </label>
                    <Select
                      value={perPage.toString()}
                      onValueChange={(value) => setPerPage(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select items per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 per page</SelectItem>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results Summary + ProductBase filter tabs */}
      {!loading && (
        <>
          {/* ProductBase Tabs */}
          {availableProductBases.length > 0 && (
            <Tabs
              value={activeBaseTab}
              onValueChange={setActiveBaseTab}
              className="w-full"
            >
              <TabsList className="h-auto flex-wrap gap-1 bg-muted/60 p-1">
                <TabsTrigger
                  value="all"
                  className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  All
                  <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {productTypes.length}
                  </span>
                </TabsTrigger>
                {availableProductBases.map((base) => {
                  const count = productTypes.filter((pt) =>
                    pt.productBases?.includes(base._id),
                  ).length;
                  return (
                    <TabsTrigger
                      key={base._id}
                      value={base._id}
                      className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      {base.title}
                      <span
                        className={cn(
                          "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          activeBaseTab === base._id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {count}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing{" "}
              {
                (activeBaseTab === "all"
                  ? productTypes
                  : productTypes.filter((pt) =>
                      pt.productBases?.includes(activeBaseTab),
                    )
                ).length
              }{" "}
              of {total} product types
              {searchTerm && ` for "${searchTerm}"`}
              {activeBaseTab !== "all" &&
                ` in ${availableProductBases.find((b) => b._id === activeBaseTab)?.title}`}
            </span>
            {(searchTerm || sortOrder !== "desc" || activeFilter !== "all") && (
              <Badge variant="secondary" className="ml-2">
                {[
                  searchTerm && "Filtered",
                  sortOrder === "asc" && "Sorted",
                  activeFilter !== "all" && "Status Filtered",
                ]
                  .filter(Boolean)
                  .join(" & ")}
              </Badge>
            )}
          </div>
        </>
      )}

      {/* Table */}
      <Card>
        <div className="rounded-md border-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 whitespace-nowrap">#</TableHead>
                <TableHead className="whitespace-nowrap min-w-[180px]">
                  Name
                </TableHead>
                <TableHead className="whitespace-nowrap min-w-[160px]">
                  Title
                </TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">BG Color</TableHead>
                <TableHead className="whitespace-nowrap min-w-[140px]">
                  Pages
                </TableHead>
                <TableHead className="whitespace-nowrap min-w-[140px]">
                  Bases
                </TableHead>
                <TableHead className="whitespace-nowrap">Order</TableHead>
                {isAdmin && (
                  <TableHead className="w-25 text-right whitespace-nowrap min-w-[140px]">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: perPage }).map((_, index) => (
                  <SkeletonRow key={`skeleton-${index}`} />
                ))
              ) : displayedTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 8 : 7}
                    className="text-center py-8"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Tag className="h-8 w-8" />
                      <span>No product types found</span>
                      {searchTerm && (
                        <Button
                          variant="link"
                          onClick={() => setSearchTerm("")}
                          size="sm"
                        >
                          Clear search to see all product types
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedTypes.map((productType, index) => (
                  <motion.tr
                    key={productType._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {(currentPage - 1) * perPage + index + 1}
                    </TableCell>

                    <TableCell className="font-medium">
                      {productType.name}
                      {productType.slug && (
                        <div className="text-xs text-muted-foreground font-mono">
                          /{productType.slug}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {productType.title || "-"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={productType.isActive ? "default" : "secondary"}
                      >
                        {productType.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-muted-foreground/20 shadow-xs"
                          style={{
                            backgroundColor: productType.bgColor || "#ffffff",
                          }}
                        />
                        <span className="text-[10px] text-muted-foreground font-mono uppercase">
                          {productType.bgColor || "#ffffff"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[120px]">
                      <div className="flex flex-wrap gap-1 items-center">
                        {productType.bannerPages &&
                        productType.bannerPages.length > 0 ? (
                          <>
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1 py-0 cursor-default"
                            >
                              {availableBannerPages.find(
                                (p) => p._id === productType.bannerPages![0],
                              )?.name || "Page"}
                            </Badge>
                            {productType.bannerPages.length > 1 && (
                              <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-1 py-0 cursor-help hover:bg-secondary/80"
                                    >
                                      +{productType.bannerPages.length - 1}{" "}
                                      others
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                                      {productType.bannerPages
                                        .slice(1)
                                        .map((pageId) => {
                                          const page =
                                            availableBannerPages.find(
                                              (p) => p._id === pageId,
                                            );
                                          return (
                                            <span
                                              key={pageId}
                                              className="text-xs font-medium"
                                            >
                                              {page ? page.name : "Page"}
                                            </span>
                                          );
                                        })}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            None
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[120px]">
                      <div className="flex flex-wrap gap-1 items-center">
                        {productType.productBases &&
                        productType.productBases.length > 0 ? (
                          <>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 py-0 cursor-default"
                            >
                              {availableProductBases.find(
                                (b) => b._id === productType.productBases![0],
                              )?.title || "Base"}
                            </Badge>
                            {productType.productBases.length > 1 && (
                              <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1 py-0 cursor-help hover:bg-accent"
                                    >
                                      +{productType.productBases.length - 1}{" "}
                                      others
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                                      {productType.productBases
                                        .slice(1)
                                        .map((baseId) => {
                                          const base =
                                            availableProductBases.find(
                                              (b) => b._id === baseId,
                                            );
                                          return (
                                            <span
                                              key={baseId}
                                              className="text-xs font-medium"
                                            >
                                              {base ? base.title : "Base"}
                                            </span>
                                          );
                                        })}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            None
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{productType.displayOrder}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canPerformCRUD && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(productType)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDuplicate(productType)}
                                title="Duplicate — opens add form pre-filled"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(productType)}
                                className="hover:text-error-main hoverEffect"
                                title="Delete"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {isReadOnly && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              View only
                            </span>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({total} total product types)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProductTypes(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProductTypes(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => fetchProductTypes(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProductTypes(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProductTypes(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Type Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditMode ? "Edit Product Type" : "Add Product Type"}
            </SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Update product type information"
                : "Create a new product classification type"}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit as any)}
              className="space-y-6 py-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Featured Products"
                        disabled={formLoading}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!isEditMode) {
                            const generatedSlug = e.target.value
                              .toLowerCase()
                              .replace(/[^\w ]+/g, "")
                              .replace(/ +/g, "-");
                            form.setValue("slug", generatedSlug);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Display name for this product type
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                          /
                        </div>
                        <Input
                          {...field}
                          placeholder="featured-products"
                          disabled={formLoading}
                          className="pl-6"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      URL-friendly identifier (auto-generated from name)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Title (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Discover Our Latest Collection"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Short tagline or title for visual displays
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe this product type..."
                        disabled={formLoading}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="banner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Banner Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={(field.value as string) ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Large banner image for this product type section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Accordion
                type="single"
                collapsible
                defaultValue="colors"
                className="w-full"
              >
                <AccordionItem value="colors">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline px-1">
                    Background Colors
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-1 pb-4">
                    <FormField
                      control={form.control}
                      name="bgColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Background Color</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3">
                              <Input
                                {...field}
                                type="color"
                                className="w-20 h-10 cursor-pointer"
                                disabled={formLoading}
                                value={
                                  /^#[0-9A-Fa-f]{6}$/.test(field.value)
                                    ? field.value
                                    : "#ffffff"
                                }
                              />
                              <Input
                                {...field}
                                type="text"
                                placeholder="#ffffff"
                                className="flex-1 font-mono"
                                disabled={formLoading}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Background color for banners (default: #ffffff)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Dynamically render a background color picker for each selected ProductBase */}
                    {form.watch("productBases")?.map((baseId) => {
                      const baseData = availableProductBases.find(
                        (b) => b._id === baseId,
                      );
                      if (!baseData || !baseData.slug) return null;

                      // Use the slug as the key for the background color
                      return (
                        <FormField
                          key={baseId}
                          control={form.control}
                          name={
                            `productBasesBg.${baseData.slug}` as keyof FormData
                          }
                          render={({ field }) => (
                            <FormItem className="pl-4 border-l-2 border-primary/20 pt-2 mt-2">
                              <FormLabel className="text-sm font-medium">
                                {baseData.title} Background Color
                              </FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-3">
                                  <Input
                                    {...field}
                                    value={
                                      (field.value as string) ||
                                      form.watch("bgColor") ||
                                      "#ffffff"
                                    }
                                    onChange={(e) =>
                                      field.onChange(e.target.value)
                                    }
                                    type="color"
                                    className="w-20 h-10 cursor-pointer"
                                    disabled={formLoading}
                                  />
                                  <Input
                                    {...field}
                                    value={
                                      (field.value as string) ||
                                      form.watch("bgColor") ||
                                      "#ffffff"
                                    }
                                    onChange={(e) =>
                                      field.onChange(e.target.value)
                                    }
                                    type="text"
                                    placeholder="#ffffff"
                                    className="flex-1 font-mono"
                                    disabled={formLoading}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // Clear this specific background color to let it fallback to default
                                      const currentBgs =
                                        form.getValues("productBasesBg") || {};
                                      const newBgs = { ...currentBgs };
                                      delete newBgs[baseData.slug];
                                      form.setValue("productBasesBg", newBgs, {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    }}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    Clear
                                  </Button>
                                </div>
                              </FormControl>
                              <FormDescription>
                                Override the generic background color
                                specifically for {baseData.title}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <FormField
                control={form.control}
                name="bannerPages"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Display on Pages</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value?.length && "text-muted-foreground",
                            )}
                            disabled={formLoading}
                          >
                            {field.value?.length
                              ? `${field.value.length} pages selected`
                              : "Select pages"}
                            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--radix-popover-trigger-width) p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder="Search pages..." />
                          <CommandEmpty>No page found.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-60">
                              {availableBannerPages.map((page) => (
                                <CommandItem
                                  key={page._id}
                                  onSelect={() => {
                                    const currentValues = field.value || [];
                                    const newValues = currentValues.includes(
                                      page._id,
                                    )
                                      ? currentValues.filter(
                                          (v) => v !== page._id,
                                        )
                                      : [...currentValues, page._id];
                                    field.onChange(newValues);
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      (field.value || []).includes(page._id)
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible",
                                    )}
                                  >
                                    <Plus className={cn("h-4 w-4")} />
                                  </div>
                                  <span>{page.name}</span>
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select which pages this product type should be displayed
                      on
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productBases"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Product Bases</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value?.length && "text-muted-foreground",
                            )}
                            disabled={formLoading}
                          >
                            {field.value?.length
                              ? `${field.value.length} ${field.value.length === 1 ? "base" : "bases"} selected`
                              : "Select product bases"}
                            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-(--radix-popover-trigger-width) p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder="Search product bases..." />
                          <CommandEmpty>No product base found.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-60">
                              {availableProductBases.map((base) => (
                                <CommandItem
                                  key={base._id}
                                  onSelect={() => {
                                    const currentValues = field.value || [];
                                    const newValues = currentValues.includes(
                                      base._id,
                                    )
                                      ? currentValues.filter(
                                          (v) => v !== base._id,
                                        )
                                      : [...currentValues, base._id];
                                    field.onChange(newValues);
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      (field.value || []).includes(base._id)
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible",
                                    )}
                                  >
                                    <Plus className={cn("h-4 w-4")} />
                                  </div>
                                  <span>{base.title}</span>
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {/* Show selected bases as badges */}
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {field.value.map((baseId) => {
                          const base = availableProductBases.find(
                            (b) => b._id === baseId,
                          );
                          return base ? (
                            <Badge
                              key={baseId}
                              variant="secondary"
                              className="text-xs cursor-pointer"
                              onClick={() => {
                                field.onChange(
                                  (field.value || []).filter(
                                    (v) => v !== baseId,
                                  ),
                                );
                              }}
                            >
                              {base.title} ×
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    <FormDescription>
                      Select which homepage sections (bases) this product type
                      belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? "" : Number(val));
                        }}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Order in which this type appears (0 = first)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Make this product type available for use
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <SheetFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSidebarOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditMode ? (
                    "Update Product Type"
                  ) : (
                    "Create Product Type"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Product Type Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product type? This action
              cannot be undone and the product type{" "}
              <span className="font-semibold">{selectedProductType?.name}</span>{" "}
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProductType}
              className="bg-error-main hover:bg-error-dark text-white"
            >
              Yes, Delete Product Type
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
