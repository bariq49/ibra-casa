import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Edit, Trash, Plus, RefreshCw, Star } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

type CustomerReview = {
  _id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
};

const customerReviewSchema = z.object({
  name: z.string().min(2, "Name is required"),
  date: z.string().min(2, "Date/Time string is required"),
  rating: z.number().min(0).max(5),
  text: z.string().min(2, "Review text is required"),
  avatar: z.string().min(1, "Avatar is required"),
  isVerified: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

type CustomerReviewFormData = z.infer<typeof customerReviewSchema>;

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { canPerformCRUD } = usePermissions();

  const form = useForm<CustomerReviewFormData>({
    resolver: zodResolver(customerReviewSchema),
    defaultValues: {
      name: "",
      date: "",
      rating: 5,
      text: "",
      avatar: "",
      isVerified: true,
      isActive: true,
    },
  });

  const fetchReviews = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axiosPrivate.get("/customer-reviews");
      setReviews(res.data.data || []);
      
      if (isRefresh) toast({ title: "Success", description: "Refreshed reviews" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load reviews" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleEdit = (review: CustomerReview) => {
    setSelectedReview(review);
    setIsEditMode(true);
    form.reset({
      name: review.name,
      date: review.date,
      rating: review.rating,
      text: review.text,
      avatar: review.avatar,
      isVerified: review.isVerified,
      isActive: review.isActive,
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedReview(null);
    setIsEditMode(false);
    
    // Auto-generate placeholder current date to match UI style
    const now = new Date();
    const formattedDate = `${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}, ${now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}`;

    form.reset({
      name: "",
      date: formattedDate,
      rating: 5,
      text: "",
      avatar: "",
      isVerified: true,
      isActive: true,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (review: CustomerReview) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const onSubmit: SubmitHandler<CustomerReviewFormData> = async (data) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedReview) {
        await axiosPrivate.put(`/customer-reviews/${selectedReview._id}`, data);
        toast({ title: "Updated successfully" });
      } else {
        await axiosPrivate.post("/customer-reviews", data);
        toast({ title: "Created successfully" });
      }
      form.reset();
      setIsSidebarOpen(false);
      fetchReviews();
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving review" });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedReview) return;
    try {
      await axiosPrivate.delete(`/customer-reviews/${selectedReview._id}`);
      toast({ title: "Deleted successfully" });
      setIsDeleteModalOpen(false);
      fetchReviews();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trusted By Customers</h1>
          <p className="text-muted-foreground">Manage the customer review testimonials displayed on the About Page</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchReviews(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          {canPerformCRUD && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Review
            </Button>
          )}
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                </TableRow>
              ))
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No customer reviews found
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {review.avatar ? <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" /> : <span className="text-muted-foreground/50 text-xs">No img</span>}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {review.name}
                    <p className="font-normal text-xs text-muted-foreground">{review.date}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                      {review.rating.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.isVerified ? "default" : "secondary"}>
                      {review.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.isActive ? "default" : "secondary"}>
                      {review.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {canPerformCRUD && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(review)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:text-error-main" onClick={() => handleDelete(review)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{isEditMode ? "Edit Customer Review" : "Add Customer Review"}</SheetTitle>
            <SheetDescription>
              {isEditMode ? "Update the review text, rating, or author details." : "Add a new testimonial that will appear on the website."}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
              <FormField control={form.control} name="avatar" render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Avatar</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value || ""}
                      disabled={formLoading}
                      onChange={(url) => field.onChange(url)}
                    />
                  </FormControl>
                </FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Customer Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Date Header</FormLabel><FormControl><Input {...field} placeholder="e.g. 12:40PM, 14 Nov, 2026" /></FormControl></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="rating" render={({ field }) => (
                <FormItem className="pt-2">
                  <FormLabel className="flex justify-between">
                    <span>Star Rating</span>
                    <span className="font-bold flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" /> {field.value.toFixed(1)}
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={5}
                      step={0.5}
                      value={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      className="py-4"
                    />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="text" render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Text</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Write the customer's testimonial quote here..." 
                      rows={5}
                      className="resize-none"
                    />
                  </FormControl>
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4 mt-6">
                <FormField control={form.control} name="isVerified" render={({ field }) => (
                  <FormItem className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <FormLabel className="text-base text-primary">Verified badge</FormLabel>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <FormLabel className="text-base">Target visibility</FormLabel>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="button" variant="outline" onClick={() => setIsSidebarOpen(false)} className="mr-2">Cancel</Button>
                <Button type="submit" disabled={formLoading}>{formLoading ? "Saving..." : "Save Review"}</Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this customer review?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone and will permanently remove the review from the application database.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-error-main hover:bg-error-dark" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
