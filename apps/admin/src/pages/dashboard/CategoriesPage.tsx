import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { categorySchema } from "@/lib/validation";
import { DEFAULT_PER_PAGE } from "@/lib/pagination";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Package,
  ChevronRight as ChevronRightIcon,
  Folders,
  Upload,
  ChevronDown,
  Copy,
  Filter,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { AxiosError } from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CategoryBulkUploadModal } from "@/components/categories/CategoryBulkUploadModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
    level: number;
  } | null;
  level: number;
  path: string;
  order: number;
  description?: string;
  isActive: boolean;
  isFavorite?: boolean;
  productBases?: string[];
  childrenCount?: number;
  productCount?: number;
  createdAt: string;
  children?: Category[];
};

type FormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allParentCategories, setAllParentCategories] = useState<Category[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [activeBaseTab, setActiveBaseTab] = useState<string>("all");
  const [viewType, setViewType] = useState<"parent" | "subcategory" | "tree">(
    "parent",
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formLoading, setFormLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // ProductBase multi-select
  type ProductBase = { _id: string; title: string; slug: string };
  const [availableProductBases, setAvailableProductBases] = useState<
    ProductBase[]
  >([]);

  const fetchProductBases = async () => {
    try {
      const res = await axiosPrivate.get<ProductBase[]>("/product-bases");
      setAvailableProductBases(res.data);
    } catch {}
  };

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { canPerformCRUD } = usePermissions();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      icon: "",
      image: "",
      parent: null,
      order: 0,
      description: "",
      isActive: true,
      productBases: [],
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      icon: "",
      image: "",
      parent: null,
      order: 0,
      description: "",
      isActive: true,
      productBases: [],
    },
  });

  // Fetch all categories for parent selection
  const fetchAllParentCategories = async () => {
    try {
      const response = await axiosPrivate.get("/categories/admin", {
        params: {
          page: 1,
          perPage: 1000,
          sortOrder: "asc",
        },
      });
      setAllParentCategories(response?.data?.categories || []);
    } catch (error) {}
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (viewType === "tree") {
        const response = await axiosPrivate.get(
          "/categories/tree?includeInactive=true",
        );
        setCategories(response.data);
        setTotal(response.data.length); // Use root count or calculate total recursively
        setTotalPages(1);
      } else {
        const params: Record<string, string | number | undefined> = {
          page,
          perPage,
          sortOrder,
        };

        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (levelFilter !== "all") params.level = levelFilter;
        if (activeBaseTab !== "all") params.productBase = activeBaseTab;

        const response = await axiosPrivate.get("/categories/admin", {
          params,
        });
        setCategories(response?.data?.categories || []);
        setTotal(response?.data?.total || 0);
        setTotalPages(response?.data?.totalPages || 1);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const params: Record<string, string | number | undefined> = {
        page,
        perPage,
        sortOrder,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (levelFilter !== "all") params.level = levelFilter;
      if (activeBaseTab !== "all") params.productBase = activeBaseTab;

      const response = await axiosPrivate.get("/categories/admin", { params });
      setCategories(response?.data?.categories || []);
      setTotal(response?.data?.total || 0);
      setTotalPages(response?.data?.totalPages || 1);
      toast({
        title: "Success",
        description: "Categories refreshed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh categories",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [
    page,
    perPage,
    sortOrder,
    searchTerm,
    levelFilter,
    viewType,
    activeBaseTab,
  ]);

  useEffect(() => {
    fetchAllParentCategories();
    fetchProductBases();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as "asc" | "desc");
    setPage(1);
  };

  const handlePerPageChange = (value: string) => {
    setPerPage(Number(value));
    setPage(1);
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Prevent closing sidebar when form is submitting
  const handleAddModalChange = (open: boolean) => {
    if (!open && formLoading) {
      toast({
        title: "Action in Progress",
        description: "Please wait while the category is being created...",
        variant: "default",
      });
      return;
    }
    setIsAddModalOpen(open);
  };

  const handleEditModalChange = (open: boolean) => {
    if (!open && formLoading) {
      toast({
        title: "Action in Progress",
        description: "Please wait while the category is being updated...",
        variant: "default",
      });
      return;
    }
    setIsEditModalOpen(open);
  };

  const handleAddCategory = async (data: FormData) => {
    setFormLoading(true);
    try {
      const payload = {
        ...data,
        parent: data.parent || null,
      };
      await axiosPrivate.post("/categories", payload);
      toast({
        title: "Success",
        description:
          "Category created successfully! You can add another or close the form.",
      });
      formAdd.reset();
      setIsAddModalOpen(false);
      setPage(1);
      fetchCategories();
      fetchAllParentCategories();
    } catch (error: unknown) {
      let errorMessage = "Failed to create category";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      if (errorMessage.includes("already exists")) {
        formAdd.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCategory = async (data: FormData) => {
    if (!selectedCategory) return;

    setFormLoading(true);
    try {
      const payload = {
        ...data,
        parent: data.parent || null,
      };
      await axiosPrivate.put(`/categories/${selectedCategory._id}`, payload);
      toast({
        title: "Success",
        description: "Category updated successfully!",
      });
      setIsEditModalOpen(false);
      fetchCategories();
      fetchAllParentCategories();
    } catch (error: unknown) {
      let errorMessage = "Failed to update category";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      if (errorMessage.includes("already exists")) {
        formEdit.setError("name", { type: "manual", message: errorMessage });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDuplicate = (category: Category) => {
    formAdd.reset({
      name: `${category.name}-copy`,
      image: category.image || "",
      icon: category.icon || "",
      parent: category.parent?._id || null,
      order: category.order || 0,
      description: category.description || "",
      isActive: category.isActive,
      isFavorite: category.isFavorite || false,
      productBases: category.productBases || [],
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setFormLoading(true);
    try {
      await axiosPrivate.delete(`/categories/${selectedCategory._id}`);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setPage(1);
      fetchCategories();
      fetchAllParentCategories();
    } catch (error: unknown) {
      let errorMessage = "Failed to delete category";
      if (error instanceof AxiosError && error.response?.data?.message) {
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

  // Get available parent categories (exclude self and descendants)
  const getAvailableParents = (currentCategoryId?: string) => {
    if (!currentCategoryId) {
      return allParentCategories.filter((cat) => cat.level < 3); // Max 4 levels (0-3)
    }

    const currentCategory = allParentCategories.find(
      (c) => c._id === currentCategoryId,
    );
    if (!currentCategory)
      return allParentCategories.filter((cat) => cat.level < 3);

    // Exclude self and prevent circular references
    return allParentCategories.filter((cat) => {
      if (cat._id === currentCategoryId) return false;
      if (cat.level >= 3) return false;
      // Check if cat is a descendant of current category
      if (cat.path && cat.path.includes(currentCategoryId)) return false;
      return true;
    });
  };

  const getCategoryBreadcrumb = (category: Category) => {
    const parts: string[] = [];
    if (category.parent) {
      parts.push(category.parent.name);
    }
    parts.push(category.name);
    return parts.join(" › ");
  };

  // Helper function to fetch and display child categories
  const getChildCategories = (parentId: string) => {
    return categories.filter((cat) => cat.parent?._id === parentId);
  };

  // Render categories table
  const renderCategoriesTable = (categoriesToDisplay: Category[]) => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-grey-100">
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(perPage)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-12 w-12 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // Render category rows with children
    const renderCategoryRows = (
      categoryList: Category[],
      depth = 0,
    ): React.ReactNode[] => {
      const rows: React.ReactNode[] = [];

      categoryList.forEach((category) => {
        rows.push(
          <TableRow key={category._id} className="hover:bg-grey-100">
            <TableCell>
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-12 h-12 object-cover rounded-md border"
                  onError={(e) => {
                    if (e.currentTarget.src.includes("/placeholder-image.jpg"))
                      return;
                    e.currentTarget.src = "/placeholder-image.jpg";
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-grey-200 rounded-md flex items-center justify-center">
                  <Package className="h-6 w-6 text-grey-500" />
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <div
                  className="flex items-center gap-2"
                  style={{ marginLeft: `${depth * 20}px` }}
                >
                  {category.childrenCount! > 0 && (
                    <button
                      onClick={() => toggleCategoryExpansion(category._id)}
                      className="text-grey-600 hover:text-grey-900 transition-colors"
                    >
                      {expandedCategories.has(category._id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <span className="font-medium">{category.name}</span>
                  {category.childrenCount! > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {category.childrenCount} sub
                    </Badge>
                  )}
                </div>
                {category.parent && (
                  <span
                    className="text-xs text-grey-500"
                    style={{ marginLeft: `${depth * 20}px` }}
                  >
                    {getCategoryBreadcrumb(category)}
                  </span>
                )}
              </div>
            </TableCell>

            <TableCell>
              <Badge variant="secondary">L{category.level}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1 text-xs text-grey-600">
                <span>{category.productCount || 0} products</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {category.productBases && category.productBases.length > 0 ? (
                  category.productBases.map((baseId) => {
                    const base = availableProductBases.find(
                      (b) => b._id === baseId,
                    );
                    return base ? (
                      <Badge
                        key={baseId}
                        variant="outline"
                        className="text-[10px] px-1 py-0"
                      >
                        {base.title}
                      </Badge>
                    ) : null;
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={category.isActive ? "default" : "secondary"}
                className={category.isActive ? "bg-success-main" : ""}
              >
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {canPerformCRUD ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCategory(category);
                        formEdit.reset({
                          name: category.name,
                          image: category.image || "",
                          icon: category.icon || "",
                          parent: category.parent?._id || null,
                          order: category.order || 0,
                          description: category.description || "",
                          isActive: category.isActive,
                          isFavorite: category.isFavorite || false,
                          productBases: category.productBases || [],
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="text-info-main hover:bg-info-lighter hover:text-info-dark"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(category)}
                      className="text-warning-main hover:bg-warning-lighter hover:text-warning-dark"
                      title="Duplicate Category"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-error-main hover:bg-error-lighter hover:text-error-dark"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-grey-500 italic">
                    View only
                  </span>
                )}
              </div>
            </TableCell>
          </TableRow>,
        );

        // Add child rows if expanded
        if (
          expandedCategories.has(category._id) &&
          category.childrenCount! > 0
        ) {
          const children = getChildCategories(category._id);
          rows.push(...renderCategoryRows(children, depth + 1));
        }
      });

      return rows;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-grey-100">
              <TableHead className="font-semibold">Image</TableHead>
              <TableHead className="font-semibold">Name & Hierarchy</TableHead>
              <TableHead className="font-semibold">Level</TableHead>
              <TableHead className="font-semibold">Stats</TableHead>
              <TableHead className="font-semibold">Bases</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesToDisplay.length > 0 ? (
              renderCategoryRows(categoriesToDisplay)
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-grey-500"
                >
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    );
  };

  const renderCategoryTree = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-grey-500" />
        </div>
      );
    }

    const renderTreeNode = (category: Category) => {
      const isExpanded = expandedCategories.has(category._id);

      // Use nested children if available (Tree View), otherwise filter flat list
      const children =
        category.children ||
        categories.filter((c) => c.parent?._id === category._id);

      return (
        <div
          key={category._id}
          className="ml-4 border-l border-grey-200 pl-4 py-1"
        >
          <div className="flex items-center gap-2 group">
            {children.length > 0 ? (
              <button
                onClick={() => toggleCategoryExpansion(category._id)}
                className="p-0.5 hover:bg-grey-100 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-grey-500" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-grey-500" />
                )}
              </button>
            ) : (
              <span className="w-5" /> // Spacer for alignment
            )}

            <div
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border hover:shadow-sm transition-all bg-white flex-1",
                !category.isActive && "opacity-60 bg-grey-100",
                category.level === 0 && "border-l-4 border-l-primary",
              )}
            >
              <div className="h-8 w-8 rounded overflow-hidden bg-grey-100 shrink-0">
                {category.image ? (
                  <img
                    src={category.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-4 w-4 m-auto mt-2 text-grey-500" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{category.name}</span>
                  {category.icon && (
                    <span className="text-xs px-1.5 py-0.5 bg-grey-100 rounded text-grey-600 font-mono">
                      {category.icon}
                    </span>
                  )}
                  {!category.isActive && (
                    <Badge variant="secondary" className="text-[10px] h-4">
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-grey-500 flex gap-2">
                  <span>L{category.level}</span>
                  <span>•</span>
                  <span>{category.productCount || 0} products</span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canPerformCRUD && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setSelectedCategory(category);
                        formEdit.reset({
                          name: category.name,
                          image: category.image || "",
                          icon: category.icon || "",
                          parent: category.parent?._id || null,
                          order: category.order || 0,
                          description: category.description || "",
                          isActive: category.isActive,
                          productBases: category.productBases || [],
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 text-info-main" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-warning-lighter"
                      onClick={() => handleDuplicate(category)}
                      title="Duplicate Category"
                    >
                      <Copy className="h-3.5 w-3.5 text-warning-main" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash className="h-3.5 w-3.5 text-error-main" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {isExpanded && children.length > 0 && (
            <div className="mt-1">{children.map(renderTreeNode)}</div>
          )}
        </div>
      );
    };

    // In tree view, categories state contains roots. In flat view, we might need to filter.
    // However, fetchCategories now handles getting the right data.
    // If viewType is tree, categories IS the roots.
    const rootCategories =
      viewType === "tree"
        ? categories
        : categories.filter((cat) => !cat.parent);

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {rootCategories.length > 0 ? (
          rootCategories.map(renderTreeNode)
        ) : (
          <div className="text-center py-8 text-grey-500">
            No categories found
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-grey-900">
            Categories Management
          </h1>
          <p className="text-grey-600 mt-2">
            Manage product categories with hierarchical organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter/search toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSearchPanel((v) => !v)}
            title={showSearchPanel ? "Hide filters" : "Show filters"}
            className="rounded-full border-border hover:bg-grey-50 text-grey-700"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-full border-border hover:bg-grey-50 text-grey-700"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
          {canPerformCRUD && (
            <Button
              onClick={() => setIsBulkUploadOpen(true)}
              variant="outline"
              size="icon"
              className="flex items-center gap-2 rounded-full border-border hover:bg-grey-50 text-grey-700"
              disabled={loading}
              title="Bulk Upload"
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}

          {canPerformCRUD && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-full px-5 shadow-sm"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Category</span>
            </Button>
          )}

          <div className="flex items-center gap-2 ml-2">
            <Folders className="h-6 w-6 text-info-main hidden sm:block" />
            <span className="text-xl font-bold text-info-main hidden sm:block">
              {total}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Filters (collapsible) */}
      {showSearchPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm border space-y-4"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-grey-500" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="0">Root (Level 0)</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* ProductBase Tabs */}
      {availableProductBases.length > 0 && (
        <Tabs
          value={activeBaseTab}
          onValueChange={(val) => {
            setActiveBaseTab(val);
            setPage(1);
          }}
          className="w-full"
        >
          <TabsList className="h-auto flex-wrap gap-1 bg-muted/60 p-1">
            <TabsTrigger
              value="all"
              className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              All Bases
            </TabsTrigger>
            {availableProductBases.map((base) => (
              <TabsTrigger
                key={base._id}
                value={base._id}
                className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {base.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* View Type Tabs */}
      <Tabs
        value={viewType}
        onValueChange={(value) =>
          setViewType(value as "parent" | "subcategory" | "tree")
        }
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="parent">Parents</TabsTrigger>
          <TabsTrigger value="subcategory">Subcategories</TabsTrigger>
          <TabsTrigger value="tree">Tree View</TabsTrigger>
        </TabsList>

        <TabsContent value="parent" className="mt-4">
          {/* Parent Categories Table */}
          {renderCategoriesTable(categories.filter((cat) => cat.level === 0))}
        </TabsContent>

        <TabsContent value="subcategory" className="mt-4">
          {/* Subcategories Table */}
          {renderCategoriesTable(categories.filter((cat) => cat.level > 0))}
        </TabsContent>

        <TabsContent value="tree" className="mt-4">
          {/* Tree View */}
          {renderCategoryTree()}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {total > perPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-grey-200 px-4 py-3 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="text-sm text-grey-600">
              Showing{" "}
              <span className="font-medium">{(page - 1) * perPage + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * perPage, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> categories
            </div>
            <div className="text-sm text-grey-600">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {total > 0 && total <= perPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-grey-600 bg-white rounded-lg border border-grey-200 px-4 py-3"
        >
          Showing all <span className="font-medium">{total}</span> categories
        </motion.div>
      )}

      {/* Add Category Sidebar */}
      <Sheet open={isAddModalOpen} onOpenChange={handleAddModalChange}>
        <SheetContent className="overflow-y-auto sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Add Category</SheetTitle>
            <SheetDescription>Create a new product category</SheetDescription>
          </SheetHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddCategory)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={formAdd.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="parent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        disabled={formLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Root Category)
                          </SelectItem>
                          {getAvailableParents().map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {"  ".repeat(cat.level)}
                              {cat.level > 0 && "└─ "}
                              {cat.name} (L{cat.level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Leave empty for root category. Maximum 4 levels.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        rows={3}
                        placeholder="Category description for SEO..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Bases multi-select */}
              {availableProductBases.length > 0 && (
                <FormField
                  control={formAdd.control}
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
                              <ScrollArea className="h-48">
                                {availableProductBases.map((base) => (
                                  <CommandItem
                                    key={base._id}
                                    onSelect={() => {
                                      const cur = field.value || [];
                                      field.onChange(
                                        cur.includes(base._id)
                                          ? cur.filter((v) => v !== base._id)
                                          : [...cur, base._id],
                                      );
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
                                      <Plus className="h-4 w-4" />
                                    </div>
                                    <span>{base.title}</span>
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                                onClick={() =>
                                  field.onChange(
                                    (field.value || []).filter(
                                      (v) => v !== baseId,
                                    ),
                                  )
                                }
                              >
                                {base.title} ×
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                      <FormDescription>
                        Select which bases this category belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={formAdd.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={
                          field.value === 0 || field.value === undefined
                            ? ""
                            : field.value
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="isFavorite"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Favorite Status</FormLabel>
                      <FormDescription>
                        Mark category as a favorite/featured item
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. <FreshOrganicIcon /> or URL"
                        disabled={formLoading}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Component name or URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image (Optional)</FormLabel>
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

              <SheetFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="bg-primary hover:bg-primary-dark text-white rounded-full px-6">
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Edit Category Sidebar */}
      <Sheet open={isEditModalOpen} onOpenChange={handleEditModalChange}>
        <SheetContent className="overflow-y-auto sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>Update category information</SheetDescription>
          </SheetHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateCategory)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={formEdit.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="parent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                        disabled={formLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Root Category)
                          </SelectItem>
                          {getAvailableParents(selectedCategory?._id).map(
                            (cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {"  ".repeat(cat.level)}
                                {cat.level > 0 && "└─ "}
                                {cat.name} (L{cat.level})
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Cannot set self or descendants as parent
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={formLoading}
                        rows={3}
                        placeholder="Category description for SEO..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Bases multi-select */}
              {availableProductBases.length > 0 && (
                <FormField
                  control={formEdit.control}
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
                              <ScrollArea className="h-48">
                                {availableProductBases.map((base) => (
                                  <CommandItem
                                    key={base._id}
                                    onSelect={() => {
                                      const cur = field.value || [];
                                      field.onChange(
                                        cur.includes(base._id)
                                          ? cur.filter((v) => v !== base._id)
                                          : [...cur, base._id],
                                      );
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
                                      <Plus className="h-4 w-4" />
                                    </div>
                                    <span>{base.title}</span>
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                                onClick={() =>
                                  field.onChange(
                                    (field.value || []).filter(
                                      (v) => v !== baseId,
                                    ),
                                  )
                                }
                              >
                                {base.title} ×
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                      <FormDescription>
                        Select which bases this category belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={formEdit.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        value={
                          field.value === 0 || field.value === undefined
                            ? ""
                            : field.value
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Inactive categories won&apos;t be shown to users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="isFavorite"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Favorite Status</FormLabel>
                      <FormDescription>
                        Mark category as a favorite/featured item
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. <FreshOrganicIcon /> or URL"
                        disabled={formLoading}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Component name or URL</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formEdit.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Image (Optional)</FormLabel>
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

              <SheetFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="bg-primary hover:bg-primary-dark text-white rounded-full px-6">
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Category"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Category Confirmation */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              category{" "}
              <span className="font-semibold">{selectedCategory?.name}</span>
              {(selectedCategory?.childrenCount || 0) > 0 && (
                <span className="block mt-2 text-error-main font-semibold">
                  Warning: This category has {selectedCategory?.childrenCount}{" "}
                  subcategories. You must delete or reassign them first.
                </span>
              )}
              {(selectedCategory?.productCount || 0) > 0 && (
                <span className="block mt-2 text-error-main font-semibold">
                  Warning: This category has {selectedCategory?.productCount}{" "}
                  products. You must reassign or delete them first.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formLoading}
              onClick={handleDeleteCategory}
              className="bg-error-main hover:bg-error-dark text-white rounded-full px-6"
            >
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Modal */}
      <CategoryBulkUploadModal
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        parentCategories={allParentCategories}
        onSuccess={() => {
          fetchCategories();
          fetchAllParentCategories();
        }}
      />
    </div>
  );
}
