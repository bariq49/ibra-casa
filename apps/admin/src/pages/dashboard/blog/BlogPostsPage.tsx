import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { blogSchema } from "@/lib/validation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Edit, Trash, Plus, Loader2, RefreshCw, Search, Copy } from "lucide-react";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiSelect } from "@/components/ui/multi-select";

type Blog = {
  _id: string;
  title: string;
  slug: string;
  previewImage: string;
  bannerImage?: string;
  content: string;
  excerpt?: string;
  author: { _id: string; name: string };
  category: { _id: string; name: string };
  tags?: string;
  productBases?: { _id: string; title: string }[];
  isFeatured?: boolean;
  isPublished: boolean;
  publishedAt?: string;
  readTime?: number;
  views?: number;
};

type BlogAuthor = {
  _id: string;
  name: string;
};

type BlogCategory = {
  _id: string;
  name: string;
};

type BlogTag = {
  _id: string;
  name: string;
};

type ProductBase = {
  _id: string;
  title: string;
};

type FormData = z.input<typeof blogSchema>;

export default function BlogPostsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tagsDropdown, setTagsDropdown] = useState<BlogTag[]>([]);
  const [productBasesDropdown, setProductBasesDropdown] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();

  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Use FileReader to read as base64 for instant preview
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
        reader.readAsDataURL(file);
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
          ["blockquote", "code-block"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler],
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "align",
    "script",
    "direction",
    "code-block",
  ];
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD } = usePermissions();
  const isAdmin = checkIsAdmin();

  const form = useForm<FormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      previewImage: "",
      bannerImage: "",
      content: "",
      excerpt: "",
      author: "",
      category: "",
      tags: "",
      productBases: [],
      isFeatured: false,
      isPublished: false,
    },
  });

  const fetchDependencies = async () => {
    try {
      const [authorsRes, categoriesRes, tagsRes, pbRes] = await Promise.all([
        axiosPrivate.get<BlogAuthor[]>("/blog-authors/all"),
        axiosPrivate.get<BlogCategory[]>("/blog-categories/all"),
        axiosPrivate.get<BlogTag[]>("/blog-tags/all"),
        axiosPrivate.get<ProductBase[]>("/product-bases"),
      ]);
      setAuthors(authorsRes.data);
      setCategories(categoriesRes.data);
      setTagsDropdown(tagsRes.data);
      setProductBasesDropdown(pbRes.data);
    } catch (error) {
      console.error("Failed to load dependencies", error);
    }
  };

  const fetchBlogs = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await axiosPrivate.get<{ blogs: Blog[] }>("/blogs/all");
      setBlogs(response.data.blogs || []);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Blogs refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load blogs", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load blogs",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [blogs, searchTerm]);

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsEditMode(true);
    form.reset({
      title: blog.title,
      slug: blog.slug || "",
      previewImage: blog.previewImage,
      bannerImage: blog.bannerImage || "",
      content: blog.content,
      excerpt: blog.excerpt || "",
      author: blog.author._id,
      category: blog.category._id,
      tags: blog.tags ? (Array.isArray(blog.tags) ? blog.tags.join(",") : blog.tags) : "",
      productBases: blog.productBases?.map(pb => pb._id) || [],
      isFeatured: blog.isFeatured || false,
      isPublished: blog.isPublished,
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedBlog(null);
    setIsEditMode(false);
    form.reset({
      title: "",
      slug: "",
      previewImage: "",
      bannerImage: "",
      content: "",
      excerpt: "",
      author: "",
      category: "",
      tags: "",
      productBases: [],
      isFeatured: false,
      isPublished: false,
    });
    setIsSidebarOpen(true);
  };

  const handleDuplicate = (blog: Blog) => {
    setSelectedBlog(null);
    setIsEditMode(false);
    form.reset({
      title: `${blog.title}-copy`,
      slug: blog.slug ? `${blog.slug}-copy` : "",
      previewImage: blog.previewImage,
      bannerImage: blog.bannerImage || "",
      content: blog.content,
      excerpt: blog.excerpt || "",
      author: blog.author?._id || "",
      category: blog.category?._id || "",
      tags: blog.tags ? (Array.isArray(blog.tags) ? blog.tags.join(",") : blog.tags) : "",
      productBases: blog.productBases?.map(pb => pb._id) || [],
      isFeatured: false,
      isPublished: false, // Reset published state to draft
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: FormData) => {
    setFormLoading(true);
    try {
      // 1. Process Base64 images in Quill Content
      let finalContent = data.content;

      // Find all base64 data image tags in the content
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;
      const base64Images: { oldSrc: string; file: File; id: string }[] = [];

      while ((match = imgRegex.exec(finalContent)) !== null) {
        const src = match[1];
        if (src.startsWith("data:image/")) {
          // It's a base64 image
          try {
            const res = await fetch(src);
            const blob = await res.blob();
            const mimeType = blob.type;
            const extension = mimeType.split("/")[1] || "jpeg";
            const id = Math.random().toString(36).substring(7);
            const file = new File([blob], `blog_img_${id}.${extension}`, {
              type: mimeType,
            });
            
            base64Images.push({
              oldSrc: src,
              file,
              id,
            });
          } catch (error) {
            console.error("Failed to parse base64 image", error);
          }
        }
      }

      // If there are base64 images, upload them
      if (base64Images.length > 0) {
        toast({
          title: "Uploading Images",
          description: `Uploading ${base64Images.length} image(s)...`,
        });

        for (const img of base64Images) {
          const uploadFormData = new FormData();
          uploadFormData.append("image", img.file);
          uploadFormData.append("folder", "blog-content");

          try {
            const uploadRes = await axiosPrivate.post("/upload", uploadFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            const newUrl = uploadRes.data.url;
            
            // Replace the old base64 src with the new CDN src
            finalContent = finalContent.replace(img.oldSrc, newUrl);
          } catch (error) {
            console.error("Failed to upload inline image", error);
            throw new Error("Image upload failed");
          }
        }
      }

      // 2. Prepare final payload
      const payload = {
        ...data,
        content: finalContent
      };

      if (isEditMode && selectedBlog) {
        await axiosPrivate.put(`/blogs/${selectedBlog._id}`, payload);
        toast({ title: "Success", description: "Blog updated successfully" });
      } else {
        await axiosPrivate.post("/blogs", payload);
        toast({ title: "Success", description: "Blog created successfully" });
      }
      fetchBlogs();
      setIsSidebarOpen(false);
    } catch (error: any) {
      console.error("Failed to save blog", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message === "Image upload failed" ? "Failed to upload embedded images." : `Failed to ${isEditMode ? "update" : "create"} blog`,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!selectedBlog) return;
    try {
      await axiosPrivate.delete(`/blogs/${selectedBlog._id}`);
      toast({ title: "Success", description: "Blog deleted successfully" });
      setIsDeleteModalOpen(false);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to delete blog", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete blog",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage blog articles and content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchBlogs(true)}
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
              <Plus className="mr-2 h-4 w-4" /> Add Blog Post
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="rounded-md border-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-10 w-10 rounded-md" />
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
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredBlogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No blogs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBlogs.map((blog) => (
                  <TableRow key={blog._id}>
                    <TableCell>
                      <img
                        src={blog.previewImage}
                        alt={blog.title}
                        className="w-10 h-10 rounded-md object-cover border"
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {blog.title}
                    </TableCell>
                    <TableCell>{blog.author?.name || "Unknown"}</TableCell>
                    <TableCell>
                      {blog.category?.name || "Uncategorized"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={blog.isPublished ? "default" : "secondary"}
                      >
                        {blog.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(blog)}
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(blog)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(blog)}
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

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditMode ? "Edit Blog Post" : "Add Blog Post"}
            </SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Update the details of your blog post."
                : "Fill in the details to create a new blog post."}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
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
                        disabled={formLoading} 
                        onChange={(e) => {
                          field.onChange(e);
                          if (!isEditMode) {
                            form.setValue(
                              "slug",
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)+/g, "")
                            );
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} placeholder="auto-generated-slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="previewImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preview Image</FormLabel>
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
                  name="bannerImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Image (Optional)</FormLabel>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={formLoading}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select author" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {authors.map((author) => (
                            <SelectItem key={author._id} value={author._id}>
                              {author.name}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={formLoading}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={field.value}
                        onChange={field.onChange}
                        modules={modules}
                        formats={formats}
                        className="bg-white text-black rounded-md min-h-[200px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt (Short description)</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={tagsDropdown.map((t) => ({ label: t.name, value: t._id }))}
                        selected={field.value ? field.value.split(',').filter(Boolean) : []}
                        onChange={(selected) => field.onChange(selected.join(','))}
                        placeholder="Select tags..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mb-4 bg-muted/20">
                    <div className="space-y-0.5">
                      <FormLabel>Featured Post</FormLabel>
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

              <FormField
                control={form.control}
                name="productBases"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Bases</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={productBasesDropdown.map((pb) => ({ label: pb.title, value: pb._id }))}
                        selected={field.value || []}
                        onChange={(selected) => field.onChange(selected)}
                        placeholder="Select product bases..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Published</FormLabel>
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

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBlog}
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
