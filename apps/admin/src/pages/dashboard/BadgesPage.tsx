import { useState, useEffect, useMemo } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { badgeSchema } from "@/lib/validation";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Trash,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  X,
  Award,
  BarChart2,
  Filter,
} from "lucide-react";

type Badge = {
  _id: string;
  name: string;
  slug: string;
  displayOrder: number;
  createdAt: string;
};

type FormData = z.infer<typeof badgeSchema>;

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();

  const form = useForm<FormData>({
    resolver: zodResolver(badgeSchema),
    defaultValues: {
      name: "",
      displayOrder: 0,
    },
  });

  const fetchBadges = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await axiosPrivate.get<Badge[]>("/badges");
      setBadges(response.data);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Badges refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load badges", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load badges",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const filteredBadges = useMemo(() => {
    return badges.filter((badge) =>
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [badges, searchTerm]);

  const handleEdit = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsEditMode(true);
    form.reset({
      name: badge.name,
      displayOrder: badge.displayOrder,
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedBadge(null);
    setIsEditMode(false);
    form.reset({
      name: "",
      displayOrder: 0,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedBadge) {
        await axiosPrivate.put(`/badges/${selectedBadge._id}`, data);
        toast({
          title: "Success",
          description: "Badge updated successfully",
        });
      } else {
        await axiosPrivate.post("/badges", data);
        toast({
          title: "Success",
          description: "Badge created successfully",
        });
      }
      form.reset();
      setIsSidebarOpen(false);
      fetchBadges();
    } catch (error) {
      console.error("Failed to save badge", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} badge`,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBadge = async () => {
    if (!selectedBadge) return;
    try {
      await axiosPrivate.delete(`/badges/${selectedBadge._id}`);
      toast({
        title: "Success",
        description: "Badge deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchBadges();
    } catch (error) {
      console.error("Failed to delete badge", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete badge",
      });
    }
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
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
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Badges</h1>
          <p className="text-muted-foreground">Manage product badges</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowStats((v) => !v)}
            title={showStats ? "Hide stats" : "Show stats"}
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
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
            onClick={() => fetchBadges(true)}
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
              <Plus className="mr-2 h-4 w-4" /> Add Badge
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
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Total Badges
                </p>
                <div className="text-lg font-bold">
                  {loading ? <Skeleton className="h-6 w-12" /> : badges.length}
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
                      placeholder="Search badges..."
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Slug</TableHead>
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filteredBadges.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No badges found
                </TableCell>
              </TableRow>
            ) : (
              filteredBadges.map((badge, index) => (
                <TableRow key={badge._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    <UIBadge variant="secondary">{badge.name}</UIBadge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {badge.displayOrder}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {badge.slug}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canPerformCRUD ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(badge)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(badge)}
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
            <SheetTitle>{isEditMode ? "Edit Badge" : "Add Badge"}</SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Update badge information"
                : "Create a new product badge"}
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
                    <FormLabel>Name (e.g. New Arrival)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
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
                            e.target.value === "" ? 0 : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
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
                    "Update Badge"
                  ) : (
                    "Create Badge"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Badge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently remove{" "}
              <span className="font-semibold">{selectedBadge?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBadge}
              className="bg-error-main hover:bg-error-dark text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
