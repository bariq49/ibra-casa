import { useState, useEffect, useMemo } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { weightSchema } from "@/lib/validation";
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
import { Badge } from "@/components/ui/badge";
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
  Weight as WeightIcon,
  BarChart2,
  Filter,
} from "lucide-react";

type Weight = {
  _id: string;
  name: string;
  value: string;
  slug: string;
  displayOrder: number;
  priceModifier?: number;
  createdAt: string;
};

type FormData = z.infer<typeof weightSchema>;

export default function WeightsPage() {
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<Weight | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const { canPerformCRUD, isReadOnly } = usePermissions();
  const isAdmin = checkIsAdmin();

  const form = useForm<FormData>({
    resolver: zodResolver(weightSchema),
    defaultValues: {
      name: "",
      value: "",
      displayOrder: undefined as any,
      priceModifier: 0,
    },
  });

  const fetchWeights = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await axiosPrivate.get<Weight[]>("/weights");
      setWeights(response.data);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Weights refreshed successfully",
        });
      }
    } catch (error) {
      console.error("Failed to load weights", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load weights",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeights();
  }, []);

  const filteredWeights = useMemo(() => {
    return weights.filter(
      (weight) =>
        weight.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        weight.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [weights, searchTerm]);

  const handleEdit = (weight: Weight) => {
    setSelectedWeight(weight);
    setIsEditMode(true);
    form.reset({
      name: weight.name,
      value: weight.value,
      displayOrder: weight.displayOrder,
      priceModifier: weight.priceModifier ?? 0,
    });
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedWeight(null);
    setIsEditMode(false);
    form.reset({
      name: "",
      value: "",
      displayOrder: undefined as any,
      priceModifier: 0,
    });
    setIsSidebarOpen(true);
  };

  const handleDelete = (weight: Weight) => {
    setSelectedWeight(weight);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    setFormLoading(true);
    try {
      if (isEditMode && selectedWeight) {
        await axiosPrivate.put(`/weights/${selectedWeight._id}`, data);
        toast({
          title: "Success",
          description: "Weight updated successfully",
        });
      } else {
        await axiosPrivate.post("/weights", data);
        toast({
          title: "Success",
          description: "Weight created successfully",
        });
      }
      form.reset();
      setIsSidebarOpen(false);
      fetchWeights();
    } catch (error) {
      console.error("Failed to save weight", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} weight`,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteWeight = async () => {
    if (!selectedWeight) return;
    try {
      await axiosPrivate.delete(`/weights/${selectedWeight._id}`);
      toast({
        title: "Success",
        description: "Weight deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchWeights();
    } catch (error) {
      console.error("Failed to delete weight", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete weight",
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
        <Skeleton className="h-4 w-16" />
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
          <h1 className="text-3xl font-bold">Weights</h1>
          <p className="text-muted-foreground">Manage product weights</p>
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
            onClick={() => fetchWeights(true)}
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
              <Plus className="mr-2 h-4 w-4" /> Add Weight
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
                <WeightIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Total Weights
                </p>
                <div className="text-lg font-bold">
                  {loading ? <Skeleton className="h-6 w-12" /> : weights.length}
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
                      placeholder="Search weights..."
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
              <TableHead>Value (kg/g)</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Price +/-</TableHead>
              <TableHead>Slug</TableHead>
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filteredWeights.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No weights found
                </TableCell>
              </TableRow>
            ) : (
              filteredWeights.map((weight, index) => (
                <TableRow key={weight._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{weight.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{weight.value}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {weight.displayOrder}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {(weight.priceModifier ?? 0) === 0
                        ? "—"
                        : `${weight.priceModifier! > 0 ? "+" : ""}${weight.priceModifier}`}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {weight.slug}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canPerformCRUD ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(weight)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(weight)}
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
            <SheetTitle>{isEditMode ? "Edit Weight" : "Add Weight"}</SheetTitle>
            <SheetDescription>
              {isEditMode
                ? "Update weight information"
                : "Create a new product weight"}
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
                    <FormLabel>Name (e.g. 1kg)</FormLabel>
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
                    <FormLabel>Value (e.g. 1)</FormLabel>
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
                      Added to the product base price when this weight is selected.
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
                    "Update Weight"
                  ) : (
                    "Create Weight"
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
            <AlertDialogTitle>Delete Weight</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently remove{" "}
              <span className="font-semibold">{selectedWeight?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWeight}
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
