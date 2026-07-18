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
import { Textarea } from "@/components/ui/textarea";

// Define the BannerPage type
type BannerPage = {
  _id: string;
  name: string;
  title: string;
  slug: string;
  description?: string;
  createdAt: string;
};

// Define the form data type
const bannerPageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
});

type BannerPageFormData = z.infer<typeof bannerPageSchema>;

export default function BannerPagesPage() {
  const [bannerPages, setBannerPages] = useState<BannerPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingBannerPage, setEditingBannerPage] = useState<BannerPage | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBannerPage, setSelectedBannerPage] =
    useState<BannerPage | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const form = useForm<BannerPageFormData>({
    resolver: zodResolver(bannerPageSchema),
    defaultValues: {
      name: "",
      title: "",
      slug: "",
      description: "",
    },
  });

  const fetchBannerPages = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get<BannerPage[]>("/banner-pages");
      setBannerPages(response.data);
    } catch (error) {
      console.error("Failed to load banner pages", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load banner pages",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerPages();
  }, []);

  const handleEdit = (bannerPage: BannerPage) => {
    setEditingBannerPage(bannerPage);
    form.reset({
      name: bannerPage.name,
      title: bannerPage.title,
      slug: bannerPage.slug,
      description: bannerPage.description || "",
    });
    setIsSidebarOpen(true);
  };

  const handleDeleteClick = (bannerPage: BannerPage) => {
    setSelectedBannerPage(bannerPage);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBannerPage(null);
    form.reset({
      name: "",
      title: "",
      slug: "",
      description: "",
    });
    setIsSidebarOpen(true);
  };

  const handleSubmit = async (data: BannerPageFormData) => {
    setFormLoading(true);
    try {
      if (editingBannerPage) {
        await axiosPrivate.put(`/banner-pages/${editingBannerPage._id}`, data);
        toast({
          title: "Success",
          description: "Banner Page updated successfully",
        });
      } else {
        await axiosPrivate.post("/banner-pages", data);
        toast({
          title: "Success",
          description: "Banner Page created successfully",
        });
      }
      setIsSidebarOpen(false);
      fetchBannerPages();
    } catch (error: any) {
      console.error("Failed to save banner page", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save banner page",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBannerPage) return;

    setDeleteLoading(true);
    try {
      await axiosPrivate.delete(`/banner-pages/${selectedBannerPage._id}`);
      toast({
        title: "Success",
        description: "Banner Page deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchBannerPages();
    } catch (error: any) {
      console.error("Failed to delete banner page", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete banner page",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Generate slug from title automatically when adding new page
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("title", e.target.value);
    if (!editingBannerPage) {
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
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48" />
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
          <h1 className="text-3xl font-bold">Home Pages</h1>
          <p className="text-muted-foreground">
            Manage pages where banners will be displayed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchBannerPages} size="sm">
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {isAdmin && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Page
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Home Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
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
                ) : bannerPages.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 5 : 4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No banner pages found
                    </TableCell>
                  </TableRow>
                ) : (
                  bannerPages.map((page) => (
                    <TableRow key={page._id}>
                      <TableCell className="font-semibold text-primary">
                        {page.name}
                      </TableCell>
                      <TableCell>{page.title}</TableCell>
                      <TableCell>
                        <span className="bg-secondary text-background px-2 py-1 rounded text-xs font-mono">
                          {page.slug}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {page.description || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(page.createdAt).toLocaleDateString()}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(page)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteClick(page)}
                            >
                              <Trash2 className="h-4 w-4 text-background" />
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
              {editingBannerPage ? "Edit Home Page" : "Add Home Page"}
            </SheetTitle>
            <SheetDescription>
              {editingBannerPage
                ? "Update the details of the home page."
                : "Create a new home page for banner management."}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Home Page Version 1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Sellzy | Best eCommerce"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTitleChange(e);
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. home-page-v1" {...field} />
                    </FormControl>
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
                      <Textarea
                        placeholder="Optional description for this page..."
                        {...field}
                      />
                    </FormControl>
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
                  {editingBannerPage ? "Update" : "Create"}
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
              home page "{selectedBannerPage?.title}". Banners assigned to this
              page may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-background hover:bg-destructive/90"
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
