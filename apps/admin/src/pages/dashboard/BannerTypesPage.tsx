import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Loader2, Plus, Trash2, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the BannerType type
type BannerType = {
  _id: string;
  title: string;
  slug: string;
  base: string;
  createdAt: string;
};

// Define the form data type
const bannerTypeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  base: z.string().min(1, "Base Type is required"),
});

type BannerTypeFormData = z.infer<typeof bannerTypeSchema>;

export default function BannerTypesPage() {
  const [bannerTypes, setBannerTypes] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingBannerType, setEditingBannerType] = useState<BannerType | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBannerType, setSelectedBannerType] =
    useState<BannerType | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const form = useForm<BannerTypeFormData>({
    resolver: zodResolver(bannerTypeSchema),
    defaultValues: {
      title: "",
      slug: "",
      base: "hero",
    },
  });

  const fetchBannerTypes = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get<BannerType[]>("/banner-types");
      setBannerTypes(response.data);
    } catch (error) {
      console.error("Failed to load banner types", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load banner types",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerTypes();
  }, []);

  const handleEdit = (bannerType: BannerType) => {
    setEditingBannerType(bannerType);
    form.reset({
      title: bannerType.title,
      slug: bannerType.slug,
      base: bannerType.base,
    });
    setIsSidebarOpen(true);
  };

  const handleDeleteClick = (bannerType: BannerType) => {
    setSelectedBannerType(bannerType);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBannerType(null);
    form.reset({
      title: "",
      slug: "",
      base: "hero",
    });
    setIsSidebarOpen(true);
  };

  const handleSubmit = async (data: BannerTypeFormData) => {
    setFormLoading(true);
    try {
      if (editingBannerType) {
        await axiosPrivate.put(`/banner-types/${editingBannerType._id}`, data);
        toast({
          title: "Success",
          description: "Banner Type updated successfully",
        });
      } else {
        await axiosPrivate.post("/banner-types", data);
        toast({
          title: "Success",
          description: "Banner Type created successfully",
        });
      }
      setIsSidebarOpen(false);
      fetchBannerTypes();
    } catch (error: any) {
      console.error("Failed to save banner type", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save banner type",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBannerType) return;

    setDeleteLoading(true);
    try {
      await axiosPrivate.delete(`/banner-types/${selectedBannerType._id}`);
      toast({
        title: "Success",
        description: "Banner Type deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchBannerTypes();
    } catch (error: any) {
      console.error("Failed to delete banner type", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete banner type",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Generate slug from title automatically when adding new type
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("title", e.target.value);
    if (!editingBannerType) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      form.setValue("slug", slug);
    }
  };

  const SkeletonRow = () => (
    <TableRow>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Banner Types</h1>
          <p className="text-muted-foreground">
            Manage types for categorizing banners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchBannerTypes} size="sm">
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {isAdmin && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Type
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Banner Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Base Type</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created</TableHead>
                  {isAdmin && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : bannerTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No banner types found
                    </TableCell>
                  </TableRow>
                ) : (
                  bannerTypes.map((type) => (
                    <TableRow key={type._id}>
                      <TableCell className="font-medium">
                        {type.title}
                      </TableCell>
                      <TableCell>
                        <span className="bg-muted px-2 py-1 rounded text-xs capitalize">
                          {type.base}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="bg-secondary px-2 py-1 rounded text-xs font-mono">
                          {type.slug}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(type.createdAt).toLocaleDateString()}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(type)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteClick(type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent
          side="right"
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            if (formLoading) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (formLoading) e.preventDefault();
          }}
        >
          <SheetHeader>
            <SheetTitle>
              {editingBannerType ? "Edit Banner Type" : "Add Banner Type"}
            </SheetTitle>
            <SheetDescription>
              {editingBannerType
                ? "Update the details of the banner type."
                : "Create a new banner type to categorize banners."}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Home Slider"
                        {...field}
                        onChange={handleTitleChange}
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. home-slider" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="base"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Structure</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select base structure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hero">Hero</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="popup">Popup</SelectItem>
                        <SelectItem value="ad">Ad</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingBannerType ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              banner type "{selectedBannerType?.title}". Banners using this type
              may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
