import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Edit, Trash, Plus, RefreshCw, Briefcase } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicantsTable from "./ApplicantsTable";

type Career = {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: string;
};

// Form schema
const careerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  type: z.string().min(2, "Type must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirementsText: z.string(),
  benefitsText: z.string(),
  isActive: z.boolean(),
});

type CareerFormData = z.infer<typeof careerSchema>;

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD } = usePermissions();
  const isAdmin = checkIsAdmin();

  const form = useForm<CareerFormData>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      title: "",
      department: "",
      location: "Remote",
      type: "Full-Time",
      description: "",
      requirementsText: "",
      benefitsText: "",
      isActive: true,
    },
  });

  const fetchCareers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await axiosPrivate.get("/careers");
      setCareers(res.data.data || []);

      if (isRefresh) toast({ title: "Success", description: "Refreshed list" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load careers",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleEdit = (career: Career) => {
    setSelectedCareer(career);
    setIsEditMode(true);
    form.reset({
      title: career.title,
      department: career.department,
      location: career.location,
      type: career.type,
      description: career.description,
      requirementsText: career.requirements.join("\n"),
      benefitsText: career.benefits.join("\n"),
      isActive: career.isActive,
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedCareer(null);
    setIsEditMode(false);
    form.reset({
      title: "",
      department: "",
      location: "Remote",
      type: "Full-Time",
      description: "",
      requirementsText: "",
      benefitsText: "",
      isActive: true,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (career: Career) => {
    setSelectedCareer(career);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (data: CareerFormData) => {
    setFormLoading(true);
    try {
      const payload = {
        ...data,
        requirements: data.requirementsText
          .split("\n")
          .filter((i) => i.trim() !== ""),
        benefits: data.benefitsText.split("\n").filter((i) => i.trim() !== ""),
      };

      if (isEditMode && selectedCareer) {
        await axiosPrivate.put(`/careers/${selectedCareer._id}`, payload);
        toast({ title: "Updated successfully" });
      } else {
        await axiosPrivate.post("/careers", payload);
        toast({ title: "Created successfully" });
      }
      form.reset();
      setIsSidebarOpen(false);
      fetchCareers();
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving career" });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedCareer) return;
    try {
      await axiosPrivate.delete(`/careers/${selectedCareer._id}`);
      toast({ title: "Deleted successfully" });
      setIsDeleteModalOpen(false);
      fetchCareers();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Careers</h1>
          <p className="text-muted-foreground">Manage open job positions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchCareers(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </Button>
          {isAdmin && canPerformCRUD && (
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Career
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Job Postings
          </TabsTrigger>
          <TabsTrigger value="applicants" className="flex items-center gap-2">
            Applicants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6 mt-0">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
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
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : careers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No open careers found
                    </TableCell>
                  </TableRow>
                ) : (
                  careers.map((career) => (
                    <TableRow key={career._id}>
                      <TableCell className="font-medium">
                        {career.title}
                      </TableCell>
                      <TableCell>{career.department}</TableCell>
                      <TableCell>{career.location}</TableCell>
                      <TableCell>{career.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={career.isActive ? "default" : "secondary"}
                        >
                          {career.isActive ? "Active" : "Archived"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            {canPerformCRUD && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(career)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:text-error-main"
                                  onClick={() => handleDelete(career)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </>
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
        </TabsContent>

        <TabsContent value="applicants" className="mt-0">
          <ApplicantsTable />
        </TabsContent>
      </Tabs>

      {/* Sheets & Modals */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{isEditMode ? "Edit Career" : "Add Career"}</SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Update the career details"
                : "Create a new job posting"}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Full-Time, Contract, etc."
                      />
                    </FormControl>
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
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirementsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements (one per line)</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="benefitsText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benefits (one per line)</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px]" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between border p-4 rounded-lg">
                    <FormLabel>Active Posting</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSidebarOpen(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "Saving..." : "Save Career"}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this career?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-error-main hover:bg-error-dark"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
