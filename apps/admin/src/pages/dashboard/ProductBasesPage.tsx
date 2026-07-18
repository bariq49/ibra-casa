import { useState, useEffect, useMemo } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { productBaseSchema } from "@/lib/validation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  X,
  Edit,
  Trash,
  Loader2,
  BarChart2,
  Filter,
} from "lucide-react";

type ProductBase = {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
};

type FormData = {
  title: string;
  slug?: string;
  isActive: boolean;
  displayOrder: number;
};

export default function ProductBasesPage() {
  const [productBases, setProductBases] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductBase, setSelectedProductBase] =
    useState<ProductBase | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();

  const form = useForm<FormData>({
    resolver: zodResolver(productBaseSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      isActive: true,
      displayOrder: 0,
    },
  });

  const fetchProductBases = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await axiosPrivate.get<ProductBase[]>("/product-bases");
      setProductBases(response.data);
      if (isRefresh) {
        toast({
          title: "Success",
          description: "Product bases refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load product bases", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product bases",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const counts = useMemo(() => {
    return {
      all: productBases.length,
      active: productBases.filter(pb => pb.isActive).length,
      inactive: productBases.filter(pb => !pb.isActive).length,
    };
  }, [productBases]);

  const filteredProductBases = useMemo(() => {
    let result = productBases;
    if (statusFilter === "active") result = result.filter(pb => pb.isActive);
    if (statusFilter === "inactive") result = result.filter(pb => !pb.isActive);
    
    if (searchTerm.trim()) {
      result = result.filter(
        (pb) =>
          pb.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pb.slug.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return result;
  }, [productBases, searchTerm, statusFilter]);

  useEffect(() => {
    fetchProductBases();
  }, []);

  const handleAdd = () => {
    setSelectedProductBase(null);
    setIsEditMode(false);
    form.reset({ title: "", slug: "", isActive: true, displayOrder: 0 });
    setIsSidebarOpen(true);
  };

  const handleEdit = (productBase: ProductBase) => {
    setSelectedProductBase(productBase);
    setIsEditMode(true);
    form.reset({
      title: productBase.title,
      slug: productBase.slug,
      isActive: productBase.isActive,
      displayOrder: productBase.displayOrder ?? 0,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (productBase: ProductBase) => {
    setSelectedProductBase(productBase);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (values: FormData) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedProductBase) {
        await axiosPrivate.put(
          `/product-bases/${selectedProductBase._id}`,
          values,
        );
        toast({
          title: "Success",
          description: "Product base updated successfully",
        });
      } else {
        await axiosPrivate.post("/product-bases", values);
        toast({
          title: "Success",
          description: "Product base created successfully",
        });
      }
      form.reset();
      setIsSidebarOpen(false);
      fetchProductBases();
    } catch (error: any) {
      let errorMessage = `Failed to ${isEditMode ? "update" : "create"} product base`;
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

  const handleDeleteProductBase = async () => {
    if (!selectedProductBase) return;
    try {
      await axiosPrivate.delete(`/product-bases/${selectedProductBase._id}`);
      toast({
        title: "Success",
        description: "Product base deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchProductBases();
    } catch (error) {
      console.error("Failed to delete product base", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product base",
      });
    }
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-36" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      {isAdmin && (
        <TableCell>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
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
          <h1 className="text-3xl font-bold">ProductBases</h1>
          <p className="text-muted-foreground">Manage product bases</p>
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
            onClick={() => fetchProductBases(true)}
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
              <Plus className="mr-2 h-4 w-4" /> Add Product Base
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

      {/* Compact Stats Row */}
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
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Total ProductBases
                </p>
                <div className="text-lg font-bold">
                  {loading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    productBases.length
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[140px] shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-success-main/10 rounded-lg">
                <Layers className="h-4 w-4 text-success-main" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Active
                </p>
                <div className="text-lg font-bold">
                  {loading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    productBases.filter((pb) => pb.isActive).length
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search Panel */}
      {showSearchPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search product bases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  disabled={!searchTerm}
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
        <TabsList className="h-auto flex-wrap gap-1 bg-muted/60 p-1">
          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Active ({counts.active})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Inactive ({counts.inactive})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <div className="rounded-md border-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={`skeleton-${i}`} />
                ))
              ) : filteredProductBases.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 6 : 5}
                    className="text-center py-8"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Layers className="h-8 w-8" />
                      <span>No product bases found</span>
                      {searchTerm && (
                        <Button
                          variant="link"
                          onClick={() => setSearchTerm("")}
                          size="sm"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProductBases.map((productBase, index) => (
                  <motion.tr
                    key={productBase._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {productBase.title}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      /{productBase.slug}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {productBase.displayOrder ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={productBase.isActive ? "default" : "secondary"}
                      >
                        {productBase.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(productBase.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canPerformCRUD && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(productBase)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(productBase)}
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

      {/* Add/Edit Sheet */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditMode ? "Edit Product Base" : "Add Product Base"}
            </SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Update product base information"
                : "Create a new product base (e.g., Healthcare, Beauty)"}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit as any)}
              className="space-y-6 py-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Healthcare"
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
                      Display title for this product base section
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
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          /
                        </div>
                        <Input
                          {...field}
                          placeholder="healthcare"
                          disabled={formLoading}
                          className="pl-6"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      URL-friendly identifier (auto-generated from title)
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
                        type="number"
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="0"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower number = shown first in tabs (e.g. 1=Healthcare,
                      2=Beauty, 5=Electronics)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Show this product base in the store
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

              <SheetFooter>
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
                    "Update Product Base"
                  ) : (
                    "Create Product Base"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product Base</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedProductBase?.title}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProductBase}
              className="bg-error-main hover:bg-error-dark text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
