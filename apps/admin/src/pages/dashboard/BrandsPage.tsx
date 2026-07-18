import { useState, useEffect, useMemo } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { brandSchema } from "@/lib/validation";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Trash,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  X,
  Copy,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  BarChart2,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

type Brand = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productBase?: string;
  isFeatured?: boolean;
  isFavorite?: boolean;
  createdAt: string;
};

type FormData = z.infer<typeof brandSchema>;

type BrandResponse = {
  brands: Brand[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export default function BrandsPage() {
  // Data state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBases, setProductBases] = useState<any[]>([]);
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
  const [productBaseFilter, setProductBaseFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Collapsible panels
  const [showStats, setShowStats] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // Sheet state (replacing Modal state)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();

  // Single form for both add and edit
  const form = useForm<FormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      slug: "",
      image: "",
      productBase: "",
      isFeatured: false,
      isFavorite: false,
    },
  });

  // Enhanced fetch function with pagination and filters
  const fetchBrands = async (page = 1, isRefresh = false) => {
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
        ...(productBaseFilter !== "all" && { productBase: productBaseFilter }),
      });

      const response = await axiosPrivate.get<BrandResponse>(
        `/brands/admin?${params}`,
      );
      const { brands: fetchedBrands, total, totalPages } = response.data;

      setBrands(fetchedBrands);
      setTotal(total);
      setTotalPages(totalPages);
      setCurrentPage(page);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Brands refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load brands", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load brands",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProductBases = async () => {
    try {
      const response = await axiosPrivate.get("/product-bases");
      if (Array.isArray(response.data)) {
        setProductBases(response.data);
      } else if (response.data.productBases) {
        setProductBases(response.data.productBases);
      } else {
        setProductBases([]);
      }
    } catch (error) {
      console.error("Failed to fetch product bases", error);
    }
  };

  // Debounced search
  const debouncedSearchTerm = useMemo(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== null) {
        setCurrentPage(1);
        fetchBrands(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, sortOrder, perPage, productBaseFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSortOrder("desc");
    setProductBaseFilter("all");
    setCurrentPage(1);
    setPerPage(DEFAULT_PER_PAGE);
  };

  const handleRefresh = () => {
    fetchBrands(currentPage, true);
  };

  useEffect(() => {
    fetchBrands(1);
    fetchProductBases();
  }, []);

  useEffect(() => {
    return debouncedSearchTerm;
  }, [debouncedSearchTerm]);

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsEditMode(true);
    form.reset({
      name: brand.name,
      slug: brand.slug || "",
      image: brand.image || "",
      productBase: brand.productBase || "",
      isFeatured: brand.isFeatured || false,
      isFavorite: brand.isFavorite || false,
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedBrand(null);
    setIsEditMode(false);
    form.reset({
      name: "",
      slug: "",
      image: "",
      productBase: "",
      isFeatured: false,
      isFavorite: false,
    });
    setIsSidebarOpen(true);
  };

  const handleDuplicate = (brand: Brand) => {
    setSelectedBrand(null);
    setIsEditMode(false);
    form.reset({
      name: `${brand.name}-copy`,
      slug: brand.slug ? `${brand.slug}-copy` : "",
      image: brand.image || "",
      productBase: brand.productBase || "",
      isFeatured: false, // Reset featuring on duplicate
      isFavorite: false, // Reset favorite on duplicate
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (data: FormData) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedBrand) {
        // Update existing brand
        await axiosPrivate.put(`/brands/${selectedBrand._id}`, data);
        toast({
          title: "Success",
          description: "Brand updated successfully",
        });
        fetchBrands(currentPage); // Stay on current page
      } else {
        // Create new brand
        await axiosPrivate.post("/brands", data);
        toast({
          title: "Success",
          description: "Brand created successfully",
        });
        fetchBrands(1); // Reset to first page
      }
      form.reset();
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Failed to save brand", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} brand`,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;

    try {
      await axiosPrivate.delete(`/brands/${selectedBrand._id}`);
      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });
      setIsDeleteModalOpen(false);

      // Smart pagination after delete
      const newTotal = total - 1;
      const newTotalPages = Math.ceil(newTotal / perPage);
      const targetPage =
        currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;

      fetchBrands(targetPage);
    } catch (error) {
      console.error("Failed to delete brand", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete brand",
      });
    }
  };

  // Skeleton loading component
  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-10 w-10 rounded" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
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
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground">Manage your brand catalog</p>
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
              <Plus className="mr-2 h-4 w-4" /> Add Brand
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
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Total Brands
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
                      placeholder="Search brands..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!searchTerm && sortOrder === "desc"}
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
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t"
                >
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Product Base
                    </label>
                    <Select
                      value={productBaseFilter}
                      onValueChange={setProductBaseFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Product Bases" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Product Bases</SelectItem>
                        {productBases.map((base) => (
                          <SelectItem key={base._id} value={base._id}>
                            {base.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {brands.length} of {total} brands
            {searchTerm && ` for "${searchTerm}"`}
          </span>
          {(searchTerm || sortOrder !== "desc") && (
            <Badge variant="secondary" className="ml-2">
              {[searchTerm && "Filtered", sortOrder === "asc" && "Sorted"]
                .filter(Boolean)
                .join(" & ")}
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="rounded-md border-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Product Base</TableHead>
                <TableHead>Badges</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loading
                Array.from({ length: perPage }).map((_, index) => (
                  <SkeletonRow key={`skeleton-${index}`} />
                ))
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 7 : 6}
                    className="text-center py-8"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span>No brands found</span>
                      {searchTerm && (
                        <Button
                          variant="link"
                          onClick={() => setSearchTerm("")}
                          size="sm"
                        >
                          Clear search to see all brands
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand, index) => (
                  <motion.tr
                    key={brand._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {(currentPage - 1) * perPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {brand.image ? (
                          <img
                            src={brand.image}
                            alt={brand.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {brand.slug}
                    </TableCell>
                    <TableCell>
                      {brand.productBase ? (
                        <Badge variant="outline" className="text-xs">
                          {productBases.find((b) => b._id === brand.productBase)
                            ?.title || "Unknown"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {brand.isFeatured && (
                          <Badge variant="default" className="bg-warning-main hover:bg-warning-main text-[10px] h-5">
                            Featured
                          </Badge>
                        )}
                        {brand.isFavorite && (
                          <Badge variant="default" className="bg-pink-500 hover:bg-pink-600 text-[10px] h-5">
                            Favorite
                          </Badge>
                        )}
                        {!brand.isFeatured && !brand.isFavorite && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canPerformCRUD && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(brand)}
                                title="Edit Brand"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDuplicate(brand)}
                                title="Duplicate Brand"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(brand)}
                                className="hover:text-error-main hoverEffect"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {isReadOnly && (
                            <span className="text-xs text-muted-foreground">
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
            Page {currentPage} of {totalPages} ({total} total brands)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBrands(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBrands(currentPage - 1)}
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
                    onClick={() => fetchBrands(pageNum)}
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
              onClick={() => fetchBrands(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBrands(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Brand Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditMode ? "Edit Brand" : "Add Brand"}</SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Update brand information"
                : "Create a new product brand"}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
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
                        disabled={formLoading}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!isEditMode) {
                            form.setValue("slug", generateSlug(e.target.value));
                          }
                        }}
                      />
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
                      Slug (Optional, auto-generated if blank)
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          {...field}
                          disabled={formLoading}
                          placeholder="my-brand-slug"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentName = form.getValues("name");
                          if (currentName) {
                            form.setValue("slug", generateSlug(currentName));
                          }
                        }}
                        disabled={formLoading}
                        className="shrink-0"
                      >
                        Generate Slug
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Base</FormLabel>
                    <Select
                      disabled={formLoading}
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product base" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {productBases.map((base) => (
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
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured Brand</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Highlight this brand in the featured section
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={formLoading}
                        aria-label="Toggle featured status"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFavorite"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Favorite Brand</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Highlight this brand in the favorite section
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={formLoading}
                        aria-label="Toggle favorite status"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <SheetFooter className="gap-2 sm:gap-0 mt-4">
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
                    "Update Brand"
                  ) : (
                    "Create Brand"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Brand Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this brand? This action cannot be
              undone and the brand{" "}
              <span className="font-semibold">{selectedBrand?.name}</span> will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBrand}
              className="bg-error-main hover:bg-error-dark text-white"
            >
              Yes, Delete Brand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
