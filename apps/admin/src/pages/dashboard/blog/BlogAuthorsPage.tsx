import { useState, useEffect, useCallback, useMemo } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { blogAuthorSchema } from "@/lib/validation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash, Plus, Loader2, RefreshCw, Search } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

type BlogAuthor = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  role?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  isActive: boolean;
  createdAt: string;
};

type FormData = z.input<typeof blogAuthorSchema>;

export default function BlogAuthorsPage() {
  // Data state
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<{ _id: string; name: string; avatar?: string; email: string }[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");

  // Sheet state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<BlogAuthor | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD } = usePermissions();
  const isAdmin = checkIsAdmin();

  // Form
  const form = useForm<FormData>({
    resolver: zodResolver(blogAuthorSchema),
    defaultValues: {
      name: "",
      image: "",
      role: "",
      bio: "",
      socialLinks: {
        twitter: "",
        linkedin: "",
        facebook: "",
        instagram: "",
        website: "",
      },
      isActive: true,
    },
  });

  const fetchAuthors = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response =
        await axiosPrivate.get<BlogAuthor[]>("/blog-authors/all");
      setAuthors(response.data);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Authors refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load authors", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load authors",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [axiosPrivate, toast]);

  const fetchUsers = useCallback(async () => {
    setFetchingUsers(true);
    try {
      const response = await axiosPrivate.get("/users?perPage=1000");
      setUsers(response.data.users || response.data || []);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setFetchingUsers(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchAuthors();
    fetchUsers();
  }, [fetchAuthors, fetchUsers]);

  // Filtered Authors
  const filteredAuthors = useMemo(() => {
    return authors.filter((author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [authors, searchTerm]);

  const handleEdit = (author: BlogAuthor) => {
    setSelectedAuthor(author);
    setIsEditMode(true);
    form.reset({
      name: author.name,
      image: author.image,
      role: author.role || "",
      bio: author.bio || "",
      socialLinks: {
        twitter: author.socialLinks?.twitter || "",
        linkedin: author.socialLinks?.linkedin || "",
        facebook: author.socialLinks?.facebook || "",
        instagram: author.socialLinks?.instagram || "",
        website: author.socialLinks?.website || "",
      },
      isActive: author.isActive,
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedAuthor(null);
    setIsEditMode(false);
    form.reset({
      name: "",
      image: "",
      role: "Contributor",
      bio: "",
      socialLinks: {
        twitter: "",
        linkedin: "",
        facebook: "",
        instagram: "",
        website: "",
      },
      isActive: true,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (author: BlogAuthor) => {
    setSelectedAuthor(author);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedAuthor) {
        await axiosPrivate.put(`/blog-authors/${selectedAuthor._id}`, data);
        toast({ title: "Success", description: "Author updated successfully" });
      } else {
        await axiosPrivate.post("/blog-authors", data);
        toast({ title: "Success", description: "Author created successfully" });
      }
      fetchAuthors();
      setIsSidebarOpen(false);
    } catch (error) {
      console.error("Failed to save author", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} author`,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAuthor = async () => {
    if (!selectedAuthor) return;
    try {
      await axiosPrivate.delete(`/blog-authors/${selectedAuthor._id}`);
      toast({ title: "Success", description: "Author deleted successfully" });
      setIsDeleteModalOpen(false);
      fetchAuthors();
    } catch (error) {
      console.error("Failed to delete author", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete author",
      });
    }
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-10 w-10 rounded-full" />
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
        <Skeleton className="h-8 w-8" />
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
          <h1 className="text-3xl font-bold">Blog Authors</h1>
          <p className="text-muted-foreground">
            Manage contributors and editors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchAuthors(true)}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {isAdmin && canPerformCRUD && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Author
            </Button>
          )}
        </div>
      </div>

      {/* Filters (Simplified) */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="rounded-md border-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : filteredAuthors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No authors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAuthors.map((author) => (
                  <TableRow key={author._id}>
                    <TableCell>
                      <img
                        src={author.image}
                        alt={author.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{author.name}</TableCell>
                    <TableCell>{author.role || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={author.isActive ? "default" : "secondary"}
                      >
                        {author.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(author)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(author)}
                            className="hover:text-error-main"
                          >
                            <Trash className="h-4 w-4" />
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
      </Card>

      {/* Sidebar Form */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditMode ? "Edit Author" : "Add Author"}</SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Update the details of the blog author."
                : "Fill in the details to create a new blog author."}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 py-6"
            >
              <div className="space-y-2">
                <FormLabel>Select User to Autofill (Optional)</FormLabel>
                <Select
                  onValueChange={(userId) => {
                    const user = users.find((u) => u._id === userId);
                    if (user) {
                      form.setValue("name", user.name);
                      if (user.avatar) {
                        form.setValue("image", user.avatar);
                      }
                      // Keep other data intact
                    }
                  }}
                  disabled={formLoading || fetchingUsers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Or enter author details manually below.
                </p>
              </div>

              <FormField
                control={form.control}
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
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Editor, Writer"
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h4 className="font-medium text-sm">Social Links</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "twitter",
                    "linkedin",
                    "facebook",
                    "instagram",
                    "website",
                  ].map((social) => (
                    <FormField
                      key={social}
                      control={form.control}
                      name={`socialLinks.${social}` as keyof FormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value as string || ""}
                              placeholder={
                                social.charAt(0).toUpperCase() + social.slice(1)
                              }
                              disabled={formLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
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
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Author</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? using this account will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAuthor}
              className="bg-error-main"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
