import { useState, useEffect, useMemo } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Loader2,
  Plus,
  Trash,
  RefreshCw,
  Search,
  Filter,
  X,
  Image as ImageIcon,
  Tag,
  Trash2,
  Copy,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageUpload } from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";

// Define the Banner type based on the Banner model
type Banner = {
  _id: string;
  name: string;
  title: string;
  description?: string;
  buttonTitle?: string;
  buttonHref?: string;
  image: string;
  startFrom: number;
  bannerType: string;
  discount?: string;
  bgColor?: string;
  textColor?: string;
  weight: number;
  createdAt: string;
};

// Define BannerType for fetching
type BannerType = {
  _id: string;
  title: string;
  slug: string;
};

// Define the form data type
const bannerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  buttonTitle: z.string().optional(),
  buttonHref: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  startFrom: z.number().min(0, "Start from must be a positive number"),
  // Allow any string now as it comes from dynamic types
  bannerType: z.string().min(1, "Banner type is required"),
  discount: z.string().optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  weight: z.number().optional(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

type BannerResponse = {
  banners: Banner[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export default function BannersPage() {
  // Data state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerTypes, setBannerTypes] = useState<BannerType[]>([]); // New state for types
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [bannerType, setBannerType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Multiple selection state
  const [selectedBanners, setSelectedBanners] = useState<Set<string>>(
    new Set(),
  );
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      buttonTitle: "",
      buttonHref: "",
      image: "",
      startFrom: 0,
      bannerType: "hero",
      discount: "",
      weight: undefined,
      bgColor: "#05535c",
      textColor: "#ffffff",
    },
  });

  const formEdit = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      buttonTitle: "",
      buttonHref: "",
      image: "",
      startFrom: 0,
      bannerType: "hero",
      discount: "",
      weight: undefined,
    },
  });

  // Enhanced fetch function with pagination and filters
  const fetchBanners = async (page = 1, isRefresh = false) => {
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
        ...(bannerType !== "all" && { bannerType }),
      });

      const response = await axiosPrivate.get<BannerResponse>(
        `/banners/admin?${params}`,
      );
      const { banners: fetchedBanners, total, totalPages } = response.data;

      setBanners(fetchedBanners.sort((a, b) => a.weight - b.weight));
      setTotal(total);
      setTotalPages(totalPages);
      setCurrentPage(page);
      setOrderDirty(false);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Banners refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load banners", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load banners",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch banner types
  const fetchBannerTypes = async () => {
    try {
      const response = await axiosPrivate.get<BannerType[]>("/banner-types");
      setBannerTypes(response.data);
      // Set default banner type if not already set and types are available
      if (response.data.length > 0 && !formAdd.getValues("bannerType")) {
        // Try to find "hero" type first
        const heroType = response.data.find((t) => t.slug === "hero");
        formAdd.setValue("bannerType", heroType?.slug || response.data[0].slug);
      }
    } catch (error) {}
  };

  // Debounced search
  const debouncedSearchTerm = useMemo(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== null) {
        setCurrentPage(1);
        fetchBanners(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, bannerType, sortOrder, perPage]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setBannerType("all");
    setSortOrder("desc");
    setCurrentPage(1);
    setPerPage(DEFAULT_PER_PAGE);
  };

  const handleRefresh = () => {
    fetchBanners(currentPage, true);
  };

  useEffect(() => {
    fetchBanners(1);
    fetchBannerTypes();
  }, []);

  useEffect(() => {
    debouncedSearchTerm();
  }, [debouncedSearchTerm]);

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    formEdit.reset({
      name: banner.name,
      title: banner.title,
      description: banner.description,
      buttonTitle: banner.buttonTitle,
      buttonHref: banner.buttonHref,
      image: banner.image,
      startFrom: banner.startFrom,
      bannerType: banner.bannerType,
      discount: banner.discount || "",
      weight: banner.weight,
    });
    setIsEditModalOpen(true);
  };

  const handleDuplicate = (banner: Banner) => {
    formAdd.reset({
      name: `${banner.name} (Copy)`,
      title: banner.title,
      description: banner.description,
      buttonTitle: banner.buttonTitle,
      buttonHref: banner.buttonHref,
      image: banner.image,
      startFrom: banner.startFrom,
      bannerType: banner.bannerType,
      discount: banner.discount || "",
      weight: banner.weight,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleAddBanner = async (data: BannerFormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/banners", data);
      toast({
        title: "Success",
        description: "Banner created successfully",
      });
      formAdd.reset();
      setIsAddModalOpen(false);
      fetchBanners(1); // Reset to first page
    } catch (error) {
      console.error("Failed to create banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBanner = async (data: BannerFormData) => {
    if (!selectedBanner) return;

    setFormLoading(true);
    try {
      await axiosPrivate.put(`/banners/${selectedBanner._id}`, data);
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
      setIsEditModalOpen(false);
      fetchBanners(currentPage); // Stay on current page
    } catch (error) {
      console.error("Failed to update banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;

    setDeleteLoading(true);
    try {
      await axiosPrivate.delete(`/banners/${selectedBanner._id}`);
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
      setIsDeleteModalOpen(false);

      // Smart pagination after delete
      const newTotal = total - 1;
      const newTotalPages = Math.ceil(newTotal / perPage);
      const targetPage =
        currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;

      fetchBanners(targetPage);
    } catch (error) {
      console.error("Failed to delete banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete banner",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle select/deselect all banners
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allBannerIds = new Set(banners.map((banner) => banner._id));
      setSelectedBanners(allBannerIds);
    } else {
      setSelectedBanners(new Set());
    }
  };

  // Handle individual banner selection
  const handleSelectBanner = (bannerId: string, checked: boolean) => {
    const newSelection = new Set(selectedBanners);
    if (checked) {
      newSelection.add(bannerId);
    } else {
      newSelection.delete(bannerId);
    }
    setSelectedBanners(newSelection);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedBanners.size === 0) return;

    setBulkDeleteLoading(true);
    try {
      // Delete all selected banners
      await Promise.all(
        Array.from(selectedBanners).map((bannerId) =>
          axiosPrivate.delete(`/banners/${bannerId}`),
        ),
      );

      toast({
        title: "Success",
        description: `${selectedBanners.size} banner(s) deleted successfully`,
      });

      setIsBulkDeleteModalOpen(false);
      setSelectedBanners(new Set());

      // Smart pagination after delete
      const newTotal = total - selectedBanners.size;
      const newTotalPages = Math.ceil(newTotal / perPage);
      const targetPage =
        currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;

      fetchBanners(targetPage);
    } catch (error) {
      console.error("Failed to delete banners", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete selected banners",
      });
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBanners((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setOrderDirty(true);
        return newItems;
      });
    }
  };

  const saveNewOrder = async () => {
    setSavingOrder(true);
    try {
      const reorderData = banners.map((banner, index) => ({
        _id: banner._id,
        weight: index,
      }));

      await axiosPrivate.post("/banners/reorder", { banners: reorderData });
      toast({
        title: "Success",
        description: "Banner order saved successfully",
      });
      setOrderDirty(false);
    } catch (error) {
      console.error("Failed to save order", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save banner order",
      });
    } finally {
      setSavingOrder(false);
    }
  };

  // Sortable row component
  const SortableRow = ({ banner }: { banner: Banner; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: banner._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : 1,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        className="group hover:bg-muted/50"
      >
        <TableCell className="w-[40px]">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </TableCell>
        {isAdmin && (
          <TableCell>
            <Checkbox
              checked={selectedBanners.has(banner._id)}
              onCheckedChange={(checked) =>
                handleSelectBanner(banner._id, checked as boolean)
              }
              aria-label={`Select ${banner.name}`}
            />
          </TableCell>
        )}
        <TableCell className="font-medium text-xs text-muted-foreground">
          {banner.weight}
        </TableCell>
        <TableCell>
          <div className="w-16 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {banner.image ? (
              <img
                src={banner.image}
                alt={banner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </TableCell>
        <TableCell className="font-medium">{banner.name}</TableCell>
        <TableCell className="max-w-32 truncate" title={banner.title}>
          {banner.title}
        </TableCell>
        <TableCell>
          <Badge
            className={getBannerTypeColor(banner.bannerType)}
            variant="secondary"
          >
            {banner.bannerType}
          </Badge>
        </TableCell>
        <TableCell>{banner.startFrom}</TableCell>
        <TableCell>{new Date(banner.createdAt).toLocaleDateString()}</TableCell>
        {isAdmin && (
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(banner)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDuplicate(banner)}
                title="Duplicate"
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(banner)}
                className="h-8 w-8 p-0"
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  };

  // Clear selection when page changes or filters change
  useEffect(() => {
    setSelectedBanners(new Set());
  }, [currentPage, searchTerm, bannerType, sortOrder]);

  // Skeleton loading component
  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-10 w-20 rounded" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
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

  const getBannerTypeColor = (type: string) => {
    switch (type) {
      case "hero":
        return "bg-info-lighter text-info-dark";
      case "promotional":
        return "bg-success-lighter text-success-dark";
      case "category":
        return "bg-purple-100 text-purple-800";
      case "sale":
        return "bg-error-lighter text-error-dark";
      default:
        // Hash string to get a consistent color if unknown
        return "bg-grey-100 text-grey-800";
    }
  };

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
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">
            Manage your promotional banners
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          {isAdmin && selectedBanners.size > 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {selectedBanners.size}
            </Button>
          )}

          {isAdmin && orderDirty && (
            <Button
              onClick={saveNewOrder}
              disabled={savingOrder}
              size="sm"
              className="bg-success-main hover:bg-success-dark text-white"
            >
              {savingOrder ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Save Order
            </Button>
          )}

          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          )}
        </div>
      </div>

      {/* Compact Stats Row */}
      <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
        <Card className="flex-1 min-w-[140px] shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Total Banners
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
                {loading ? (
                  <Skeleton className="h-6 w-10" />
                ) : perPage === 1000 ? (
                  "All"
                ) : (
                  perPage
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-2 min-w-[200px] shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-success-main/10 rounded-lg">
              <Filter className="h-4 w-4 text-success-main" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Active Filters
              </p>
              <div className="text-sm font-bold truncate flex items-center gap-2">
                {loading ? (
                  <Skeleton className="h-5 w-24" />
                ) : (
                  <>
                    <Badge
                      variant="secondary"
                      className="h-5 text-[10px] capitalize px-1.5"
                    >
                      {bannerType === "all" ? "All Types" : bannerType}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions Bar */}
      <Card className="shadow-sm overflow-hidden border-0 bg-transparent">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={showFilters ? "secondary" : "outline"}
                className="h-11 shadow-sm shrink-0 flex-1 sm:flex-none"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter
                  className={`mr-2 h-4 w-4 ${showFilters ? "text-primary" : ""}`}
                />
                Filters
                {(bannerType !== "all" || sortOrder !== "desc") && (
                  <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>

              <Button
                variant="outline"
                className="h-11 shadow-sm shrink-0 flex-1 sm:flex-none"
                onClick={clearFilters}
                disabled={
                  !searchTerm &&
                  bannerType === "all" &&
                  sortOrder === "desc"
                }
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Expandable Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-dashed overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                    Banner Type
                  </label>
                  <Select value={bannerType} onValueChange={setBannerType}>
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {bannerTypes.map((type) => (
                        <SelectItem key={type.slug} value={type.slug}>
                          {type.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                    Sort Order
                  </label>
                  <Select
                    value={sortOrder}
                    onValueChange={(value: "asc" | "desc") =>
                      setSortOrder(value)
                    }
                  >
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                    Items Per Page
                  </label>
                  <Select
                    value={perPage.toString()}
                    onValueChange={(value) => setPerPage(Number(value))}
                  >
                    <SelectTrigger className="h-10 bg-background">
                      <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="30">30 per page</SelectItem>
                      <SelectItem value="1000">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {banners.length} of {total} banners
            {searchTerm && ` for "${searchTerm}"`}
            {bannerType !== "all" && ` in ${bannerType}`}
          </span>
          {(searchTerm ||
            bannerType !== "all" ||
            sortOrder !== "desc") && (
            <Badge variant="secondary" className="ml-2">
              {[
                searchTerm && "Filtered",
                bannerType !== "all" && "Type filtered",
                sortOrder === "asc" && "Sorted",
              ]
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
                {isAdmin && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        banners.length > 0 &&
                        selectedBanners.size === banners.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                <TableHead className="w-[30px]"></TableHead>
                <TableHead className="w-[50px]">Weight</TableHead>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start From</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <TableBody>
                {loading ? (
                  Array.from({ length: perPage }).map((_, index) => (
                    <SkeletonRow key={`skeleton-${index}`} />
                  ))
                ) : banners.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 9 : 7}
                      className="text-center py-8"
                    >
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Tag className="h-8 w-8" />
                        <span>No banners found</span>
                        {(searchTerm || bannerType !== "all") && (
                          <Button
                            variant="link"
                            onClick={clearFilters}
                            size="sm"
                          >
                            Clear filters to see all banners
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={banners.map((b) => b._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {banners.map((banner, index) => (
                      <SortableRow
                        key={banner._id}
                        banner={banner}
                        index={index}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </DndContext>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({total} total banners)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBanners(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBanners(currentPage - 1)}
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
                    onClick={() => fetchBanners(pageNum)}
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
              onClick={() => fetchBanners(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchBanners(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Add Banner Sidebar */}
      <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <SheetContent
          className="sm:max-w-[540px] overflow-y-auto"
          onPointerDownOutside={(e) => {
            if (formLoading) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (formLoading) e.preventDefault();
          }}
        >
          <SheetHeader>
            <SheetTitle>Add New Banner</SheetTitle>
            <SheetDescription>
              Create a new banner advertisement
            </SheetDescription>
          </SheetHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddBanner)}
              className="space-y-4 mt-6"
            >
              <FormField
                control={formAdd.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="Enter banner name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount / Offer</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="e.g., 25% OFF or Exclusive"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight / Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        disabled={formLoading}
                        placeholder="e.g. 1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="Enter banner title"
                      />
                    </FormControl>
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
                        placeholder="Enter banner description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="buttonTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="e.g., Shop Now"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="buttonHref"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Link</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="e.g., /products"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="bannerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select banner type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bannerTypes.map((type) => (
                          <SelectItem key={type.slug} value={type.slug}>
                            {type.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="bgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-3 items-center">
                          <div className="flex-1 relative">
                            <Input
                              {...field}
                              disabled={formLoading}
                              placeholder="#05535c"
                              className="pl-10"
                            />
                            <div
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-muted shadow-sm"
                              style={{
                                backgroundColor: field.value || "#05535c",
                              }}
                            />
                          </div>
                          <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-lg border border-input shadow-sm hover:ring-2 hover:ring-primary/20 transition-all">
                            <input
                              type="color"
                              value={field.value || "#05535c"}
                              onChange={(e) => field.onChange(e.target.value)}
                              disabled={formLoading}
                              className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 bg-transparent"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formAdd.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-3 items-center">
                          <div className="flex-1 relative">
                            <Input
                              {...field}
                              disabled={formLoading}
                              placeholder="#ffffff"
                              className="pl-10"
                            />
                            <div
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-muted shadow-sm"
                              style={{
                                backgroundColor: field.value || "#ffffff",
                              }}
                            />
                          </div>
                          <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-lg border border-input shadow-sm hover:ring-2 hover:ring-primary/20 transition-all">
                            <input
                              type="color"
                              value={field.value || "#ffffff"}
                              onChange={(e) => field.onChange(e.target.value)}
                              disabled={formLoading}
                              className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 bg-transparent"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={formAdd.control}
                name="startFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start From</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        disabled={formLoading}
                        placeholder="Enter start from amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Banner"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Edit Banner Sidebar */}
      <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <SheetContent
          className="sm:max-w-[540px] overflow-y-auto"
          onPointerDownOutside={(e) => {
            if (formLoading) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (formLoading) e.preventDefault();
          }}
        >
          <SheetHeader>
            <SheetTitle>Edit Banner</SheetTitle>
            <SheetDescription>Update banner information</SheetDescription>
          </SheetHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateBanner)}
              className="space-y-4 mt-6"
            >
              <FormField
                control={formEdit.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="Enter banner name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount / Offer</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="e.g., 25% OFF or Exclusive"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight / Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        disabled={formLoading}
                        placeholder="e.g. 1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="Enter banner title"
                      />
                    </FormControl>
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
                        placeholder="Enter banner description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="buttonTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="e.g., Shop Now"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="buttonHref"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Link</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={formLoading}
                        placeholder="e.g., /products"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="bannerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select banner type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bannerTypes.map((type) => (
                          <SelectItem key={type.slug} value={type.slug}>
                            {type.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="bgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-3 items-center">
                          <div className="flex-1 relative">
                            <Input
                              {...field}
                              disabled={formLoading}
                              placeholder="#05535c"
                              className="pl-10"
                            />
                            <div
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-muted shadow-sm"
                              style={{
                                backgroundColor: field.value || "#05535c",
                              }}
                            />
                          </div>
                          <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-lg border border-input shadow-sm hover:ring-2 hover:ring-primary/20 transition-all">
                            <input
                              type="color"
                              value={field.value || "#05535c"}
                              onChange={(e) => field.onChange(e.target.value)}
                              disabled={formLoading}
                              className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 bg-transparent"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formEdit.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-3 items-center">
                          <div className="flex-1 relative">
                            <Input
                              {...field}
                              disabled={formLoading}
                              placeholder="#ffffff"
                              className="pl-10"
                            />
                            <div
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-muted shadow-sm"
                              style={{
                                backgroundColor: field.value || "#ffffff",
                              }}
                            />
                          </div>
                          <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-lg border border-input shadow-sm hover:ring-2 hover:ring-primary/20 transition-all">
                            <input
                              type="color"
                              value={field.value || "#ffffff"}
                              onChange={(e) => field.onChange(e.target.value)}
                              disabled={formLoading}
                              className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none p-0 bg-transparent"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={formEdit.control}
                name="startFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start From</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        disabled={formLoading}
                        placeholder="Enter start from amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Banner"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Banner Confirmation (Replacing AlertDialog with Dialog for better UX/dismissal) */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none shadow-2xl data-[state=open]:animate-custom-fade-in data-[state=closed]:animate-custom-fade-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 slide-in-from-left-0! slide-in-from-top-0! translate-x-[-50%]! translate-y-[-50%]!">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Trash2 className="size-8 text-destructive px-1" />
              </div>

              <DialogHeader className="p-0 space-y-2">
                <DialogTitle className="text-xl font-bold text-foreground text-center sm:text-center">
                  Are you sure?
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground text-center sm:text-center px-2">
                  This action cannot be undone. This will permanently delete the
                  banner{" "}
                  <span className="font-bold text-foreground inline-block px-1.5 py-0.5 bg-muted rounded">
                    {selectedBanner?.name}
                  </span>
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="bg-muted/30 p-4 flex flex-col sm:flex-row gap-2 border-t mt-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={deleteLoading}
                className="flex-1 h-11 rounded-xl border-2 font-bold hover:bg-muted transition-all active:scale-[0.98] mt-0"
              >
                No, Keep It
              </Button>
            </DialogClose>
            <Button
              onClick={handleDeleteBanner}
              disabled={deleteLoading}
              className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 shadow-lg shadow-destructive/20 transition-all active:scale-[0.98]"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete It"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation (Updating for consistency) */}
      <Dialog
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
      >
        <DialogContent className="max-w-[400px] p-0 overflow-hidden border-none shadow-2xl data-[state=open]:animate-custom-fade-in data-[state=closed]:animate-custom-fade-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 translate-x-[-50%]! translate-y-[-50%]! slide-in-from-left-0! slide-in-from-top-0!">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Trash2 className="size-8 text-destructive px-1" />
              </div>

              <DialogHeader className="p-0 space-y-2">
                <DialogTitle className="text-xl font-bold text-foreground text-center sm:text-center">
                  Delete Multiple Banners?
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground text-center sm:text-center px-2">
                  This action cannot be undone. This will permanently delete{" "}
                  <span className="font-bold text-foreground inline-block px-1.5 py-0.5 bg-muted rounded">
                    {selectedBanners.size} banner(s)
                  </span>
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="bg-muted/30 p-4 flex flex-col sm:flex-row gap-2 border-t mt-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={bulkDeleteLoading}
                className="flex-1 h-11 rounded-xl border-2 font-bold hover:bg-muted transition-all active:scale-[0.98] mt-0"
              >
                No, Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 shadow-lg shadow-destructive/20 transition-all active:scale-[0.98]"
            >
              {bulkDeleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete All"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
