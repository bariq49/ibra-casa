import { useState, useEffect, useMemo } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { colorSchema } from "@/lib/validation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Trash,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  X,
  Palette,
  BarChart2,
} from "lucide-react";

type Color = {
  _id: string;
  name: string;
  value: string;
  slug: string;
  displayOrder: number;
  priceModifier?: number;
  createdAt: string;
};

type FormData = z.infer<typeof colorSchema>;

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Collapsible panels
  const [showStats, setShowStats] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();

  const form = useForm<FormData>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      name: "",
      value: "",
      displayOrder: undefined as any,
      priceModifier: 0,
    },
  });

  const fetchColors = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await axiosPrivate.get<Color[]>("/colors");
      setColors(response.data);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Colors refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load colors", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load colors",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const filteredColors = useMemo(() => {
    return colors.filter(
      (color) =>
        color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [colors, searchTerm]);

  const handleEdit = (color: Color) => {
    setSelectedColor(color);
    setIsEditMode(true);
    form.reset({
      name: color.name,
      value: color.value,
      displayOrder: color.displayOrder,
      priceModifier: color.priceModifier ?? 0,
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedColor(null);
    setIsEditMode(false);
    form.reset({
      name: "",
      value: "",
      displayOrder: undefined as any,
      priceModifier: 0,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (color: Color) => {
    setSelectedColor(color);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedColor) {
        await axiosPrivate.put(`/colors/${selectedColor._id}`, data);
        toast({
          title: "Success",
          description: "Color updated successfully",
        });
      } else {
        await axiosPrivate.post("/colors", data);
        toast({
          title: "Success",
          description: "Color created successfully",
        });
      }
      form.reset();
      setIsSidebarOpen(false);
      fetchColors();
    } catch (error) {
      console.error("Failed to save color", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} color`,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteColor = async () => {
    if (!selectedColor) return;
    try {
      await axiosPrivate.delete(`/colors/${selectedColor._id}`);
      toast({
        title: "Success",
        description: "Color deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchColors();
    } catch (error) {
      console.error("Failed to delete color", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete color",
      });
    }
  };

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
        <Skeleton className="h-4 w-12" />
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
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Colors</h1>
          <p className="text-muted-foreground">Manage product colors</p>
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
            onClick={() => fetchColors(true)}
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
              <Plus className="mr-2 h-4 w-4" /> Add Color
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

      {/* Compact Stats Row - Collapsed vertically behind BarChart2 toggle */}
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
                <Palette className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Total Colors
                </p>
                <div className="text-lg font-bold">
                  {loading ? <Skeleton className="h-6 w-12" /> : colors.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search Panel - Collapsible search controlled by Filter toggle */}
      {showSearchPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search colors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  disabled={!searchTerm}
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="w-20">Preview</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Value (Hex/CSS)</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Price +/-</TableHead>
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filteredColors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No colors found
                </TableCell>
              </TableRow>
            ) : (
              filteredColors.map((color, index) => (
                <TableRow key={color._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div
                      className="w-8 h-8 rounded-full border shadow-sm"
                      style={{ backgroundColor: color.value }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{color.name}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      {color.value}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {color.displayOrder}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {(color.priceModifier ?? 0) === 0
                        ? "—"
                        : `${color.priceModifier! > 0 ? "+" : ""}${color.priceModifier}`}
                    </span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canPerformCRUD ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(color)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(color)}
                              className="hover:text-error-main"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          isReadOnly && (
                            <span className="text-xs text-muted-foreground">
                              View only
                            </span>
                          )
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{isEditMode ? "Edit Color" : "Add Color"}</SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Update color information"
                : "Create a new product color"}
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
                    <FormLabel>Name (e.g. Red)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value (e.g. #FF0000)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          disabled={formLoading}
                          placeholder="#000000"
                        />
                        <Input
                          type="color"
                          value={
                            field.value.startsWith("#")
                              ? field.value
                              : "#000000"
                          }
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 p-1"
                          disabled={formLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order (0, 1, 2...)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Enter order (e.g. 1, 2, 3...)"
                        disabled={formLoading}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
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
                name="priceModifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price modifier</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? 0}
                        placeholder="0"
                        disabled={formLoading}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 0
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Added to the product base price when this color is selected.
                    </p>
                    <FormMessage />
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isEditMode ? (
                    "Update Color"
                  ) : (
                    "Create Color"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Color</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently remove{" "}
              <span className="font-semibold">{selectedColor?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteColor}
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
