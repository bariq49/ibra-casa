import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Edit,
  Loader2,
  Plus,
  Trash,
  RefreshCw,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

type AdsBanner = {
  _id: string;
  name: string;
  title: string;
  description?: string;
  image: string;
  buttonTitle?: string;
  buttonHref?: string;
  bgColor?: string;
  cardColor?: string;
  bannerType: "advertisement" | "promotional" | "seasonal" | "offer";
  productTypes?: string[] | { _id: string; title: string; name: string }[];
  productBases?: string[] | { _id: string; title: string }[];
  isActive: boolean;
  order: number;
  createdAt: string;
};

const adsBannerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  buttonTitle: z.string().optional(),
  buttonHref: z.string().optional(),
  bgColor: z.string().optional(),
  cardColor: z.string().optional(),
  bannerType: z.enum(["advertisement", "promotional", "seasonal", "offer"]),
  productTypes: z.array(z.string()).optional(),
  productBases: z.array(z.string()).optional(),
  order: z.union([z.string(), z.number()]),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof adsBannerSchema>;

export default function AdsBannersPage() {
  const [banners, setBanners] = useState<AdsBanner[]>([]);
  const [productTypes, setProductTypes] = useState<
    { _id: string; title: string; name: string; productBases?: any[] }[]
  >([]);
  const [productBases, setProductBases] = useState<
    { _id: string; title: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<AdsBanner | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [bannerTypeFilter, setBannerTypeFilter] = useState("all");

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { canPerformCRUD } = usePermissions();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(adsBannerSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      image: "",
      buttonTitle: "",
      buttonHref: "",
      bgColor: "#ffffff",
      cardColor: "#ffffff",
      bannerType: "advertisement",
      productTypes: [],
      productBases: [],
      isActive: true,
      order: "" as unknown as number,
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(adsBannerSchema),
  });

  const activeProductBasesAdd = formAdd.watch("productBases");
  const activeProductBasesEdit = formEdit.watch("productBases");

  const filteredProductTypesAdd = productTypes.filter((t) => {
    if (!activeProductBasesAdd || activeProductBasesAdd.length === 0)
      return true;
    if (!t.productBases || t.productBases.length === 0) return false;
    return t.productBases.some((base) =>
      activeProductBasesAdd.includes(
        typeof base === "object" ? base._id : base,
      ),
    );
  });

  const filteredProductTypesEdit = productTypes.filter((t) => {
    if (!activeProductBasesEdit || activeProductBasesEdit.length === 0)
      return true;
    if (!t.productBases || t.productBases.length === 0) return false;
    return t.productBases.some((base) =>
      activeProductBasesEdit.includes(
        typeof base === "object" ? base._id : base,
      ),
    );
  });

  useEffect(() => {
    const activeTypes = formAdd.getValues("productTypes") || [];
    if (
      activeTypes.length > 0 &&
      activeProductBasesAdd &&
      activeProductBasesAdd.length > 0
    ) {
      const validTypes = activeTypes.filter((typeId) =>
        filteredProductTypesAdd.some((t) => t._id === typeId),
      );
      if (validTypes.length !== activeTypes.length) {
        formAdd.setValue("productTypes", validTypes);
      }
    } else if (!activeProductBasesAdd || activeProductBasesAdd.length === 0) {
      if (activeTypes.length > 0) {
        formAdd.setValue("productTypes", []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProductBasesAdd, productTypes]);

  useEffect(() => {
    // For Edit mode, we don't automatically wipe empty productBases so that hydrate steps don't break.
    const activeTypes = formEdit.getValues("productTypes") || [];
    if (
      activeTypes.length > 0 &&
      activeProductBasesEdit &&
      activeProductBasesEdit.length > 0
    ) {
      const validTypes = activeTypes.filter((typeId) =>
        filteredProductTypesEdit.some((t) => t._id === typeId),
      );
      if (validTypes.length !== activeTypes.length) {
        formEdit.setValue("productTypes", validTypes);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProductBasesEdit, productTypes]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const url =
        bannerTypeFilter !== "all"
          ? `/ads-banners?bannerType=${bannerTypeFilter}`
          : "/ads-banners";
      const response = await axiosPrivate.get(url);
      setBanners(response.data?.adsBanners || []);
    } catch (error) {
      console.error("Failed to fetch ads banners", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load ads banners",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBanners();
    setRefreshing(false);
  };

  const fetchProductMetadata = async () => {
    try {
      const [pdTypesRes, pdBasesRes] = await Promise.all([
        axiosPrivate.get("/product-types?perPage=1000"),
        axiosPrivate.get("/product-bases?perPage=1000"),
      ]);
      setProductTypes(pdTypesRes.data?.productTypes || pdTypesRes.data || []);
      setProductBases(pdBasesRes.data?.productBases || pdBasesRes.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch product metadata for Ads banner form",
        error,
      );
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [bannerTypeFilter]);

  useEffect(() => {
    fetchProductMetadata();
  }, []);

  // Helper function to delete images from Cloudinary
  const deleteImagesFromStorage = async (identifier: string) => {
    try {
      await axiosPrivate.delete("/upload/delete", {
        data: { identifier },
      });
    } catch (error) {
      console.error(`Failed to delete image ${identifier}:`, error);
    }
  };

  const handleAddBanner = async (data: FormData) => {
    setFormLoading(true);
    try {
      let imageUrl = data.image;

      // Upload image if it is base64
      if (data.image.startsWith("data:")) {
        toast({
          title: "Uploading Image",
          description: "Uploading banner image...",
        });

        try {
          const response = await axiosPrivate.post("/upload", {
            image: data.image,
            folder: "ads-banner",
          });
          imageUrl = response.data.url;
        } catch (error) {
          console.error("Error uploading image:", error);
          // eslint-disable-next-line preserve-caught-error
          throw new Error("Failed to upload image");
        }
      }

      await axiosPrivate.post("/ads-banners", {
        ...data,
        order: data.order === "" ? 0 : Number(data.order),
        image: imageUrl,
      });
      toast({
        title: "Success",
        description: "Ads banner created successfully",
      });
      setIsAddModalOpen(false);
      formAdd.reset();
      fetchBanners();
    } catch (error) {
      console.error("Failed to create ads banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create ads banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBanner = async (data: FormData) => {
    if (!selectedBanner) return;

    setFormLoading(true);
    try {
      let imageUrl = data.image;

      // Upload new image if it is base64
      if (data.image.startsWith("data:")) {
        toast({
          title: "Uploading Image",
          description: "Uploading new banner image...",
        });

        try {
          const response = await axiosPrivate.post("/upload", {
            image: data.image,
            folder: "ads-banner",
          });
          imageUrl = response.data.url;

          // Delete old image if it exists and is different
          if (selectedBanner.image && selectedBanner.image !== imageUrl) {
            await deleteImagesFromStorage(selectedBanner.image);
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          // eslint-disable-next-line preserve-caught-error
          throw new Error("Failed to upload image");
        }
      }

      await axiosPrivate.put(`/ads-banners/${selectedBanner._id}`, {
        ...data,
        order: data.order === "" ? 0 : Number(data.order),
        image: imageUrl,
      });
      toast({
        title: "Success",
        description: "Ads banner updated successfully",
      });
      setIsEditModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error("Failed to update ads banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update ads banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;

    setFormLoading(true);
    try {
      // Delete image from Cloudinary first
      if (selectedBanner.image) {
        await deleteImagesFromStorage(selectedBanner.image);
      }

      await axiosPrivate.delete(`/ads-banners/${selectedBanner._id}`);
      toast({
        title: "Success",
        description: "Ads banner deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setSelectedBanner(null);
      fetchBanners();
    } catch (error) {
      console.error("Failed to delete ads banner", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete ads banner",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (banner: AdsBanner) => {
    try {
      await axiosPrivate.patch(`/ads-banners/${banner._id}/toggle`);
      toast({
        title: "Success",
        description: `Banner ${banner.isActive ? "deactivated" : "activated"}`,
      });
      fetchBanners();
    } catch (error) {
      console.error("Failed to toggle banner status", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update banner status",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-grey-900">Ads Banners</h1>
          <p className="text-grey-600 mt-2">
            Manage advertisement banners for your website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
          {canPerformCRUD && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ads Banner
            </Button>
          )}
        </div>
      </motion.div>

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Ads Banners ({banners.length})
            </span>
            <Select
              value={bannerTypeFilter}
              onValueChange={setBannerTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-grey-300" />
              <p className="mt-2 text-grey-500">No ads banners yet</p>
              {canPerformCRUD && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Banner
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Base & Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell>
                      <img
                        src={banner.image}
                        alt={banner.name}
                        className="h-16 w-24 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{banner.name}</TableCell>
                    <TableCell>{banner.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{banner.bannerType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {banner.productBases &&
                        banner.productBases.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs font-semibold text-grey-500">
                              Base:
                            </span>
                            {banner.productBases.map((base: any) => (
                              <Badge
                                key={base._id || base}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-4"
                              >
                                {base.title || base}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        {banner.productTypes &&
                        banner.productTypes.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs font-semibold text-grey-500">
                              Type:
                            </span>
                            {banner.productTypes.map((type: any) => (
                              <Badge
                                key={type._id || type}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-4"
                              >
                                {type.title || type.name || type}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        {!banner.productBases?.length &&
                          !banner.productTypes?.length && (
                            <span className="text-xs text-grey-500">-</span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>{banner.order}</TableCell>
                    <TableCell>
                      {canPerformCRUD ? (
                        <Switch
                          checked={banner.isActive}
                          onCheckedChange={() => handleToggleStatus(banner)}
                        />
                      ) : (
                        <Badge
                          variant={banner.isActive ? "default" : "secondary"}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {canPerformCRUD ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBanner(banner);
                              formEdit.reset({
                                name: banner.name,
                                title: banner.title,
                                description: banner.description || "",
                                image: banner.image,
                                buttonTitle: banner.buttonTitle || "",
                                buttonHref: banner.buttonHref || "",
                                bgColor: banner.bgColor || "#ffffff",
                                cardColor: banner.cardColor || "#ffffff",
                                bannerType: banner.bannerType,
                                productBases:
                                  banner.productBases?.map((b: any) =>
                                    typeof b === "object" ? b._id : b,
                                  ) || [],
                                productTypes:
                                  banner.productTypes?.map((t: any) =>
                                    typeof t === "object" ? t._id : t,
                                  ) || [],
                                isActive: banner.isActive,
                                order: banner.order,
                              });
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBanner(banner);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4 text-error-main" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-grey-500 italic">
                          View only
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Banner Sheet */}
      <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Add Ads Banner</SheetTitle>
            <SheetDescription>
              Create a new advertisement banner
            </SheetDescription>
          </SheetHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddBanner)}
              className="space-y-4"
            >
              <FormField
                control={formAdd.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={formLoading} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="buttonTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Shop Now"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formAdd.control}
                  name="buttonHref"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Href</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="/shop"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="productBases"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Bases (Optional)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={productBases.map((b) => ({
                            label: b.title,
                            value: b._id,
                          }))}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select Bases"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formAdd.control}
                  name="productTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Types (Optional)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={filteredProductTypesAdd.map((t) => ({
                            label: t.title || t.name,
                            value: t._id,
                          }))}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select Types"
                          disabled={
                            formLoading || !activeProductBasesAdd?.length
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formAdd.control}
                  name="bgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <div className="flex gap-2 items-center">
                        <FormControl>
                          <Input
                            type="color"
                            {...field}
                            className="w-12 h-10 p-1 cursor-pointer"
                            disabled={formLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="#ffffff"
                            disabled={formLoading}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formAdd.control}
                  name="cardColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Color</FormLabel>
                      <div className="flex gap-2 items-center">
                        <FormControl>
                          <Input
                            type="color"
                            {...field}
                            className="w-12 h-10 p-1 cursor-pointer"
                            disabled={formLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="#ffffff"
                            disabled={formLoading}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={formAdd.control}
                name="bannerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="advertisement">
                          Advertisement
                        </SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable to show this banner on the website
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
              <SheetFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Banner"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Edit Banner Sheet */}
      <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Edit Ads Banner</SheetTitle>
            <SheetDescription>Update banner information</SheetDescription>
          </SheetHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateBanner)}
              className="space-y-4"
            >
              <FormField
                control={formEdit.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={formLoading} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="buttonTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Shop Now"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formEdit.control}
                  name="buttonHref"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Href</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="/shop"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="productBases"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Bases (Optional)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={productBases.map((b) => ({
                            label: b.title,
                            value: b._id,
                          }))}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select Bases"
                          disabled={formLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formEdit.control}
                  name="productTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Types (Optional)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={filteredProductTypesEdit.map((t) => ({
                            label: t.title || t.name,
                            value: t._id,
                          }))}
                          selected={field.value || []}
                          onChange={field.onChange}
                          placeholder="Select Types"
                          disabled={
                            formLoading || !activeProductBasesEdit?.length
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={formEdit.control}
                  name="bgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <div className="flex gap-2 items-center">
                        <FormControl>
                          <Input
                            type="color"
                            {...field}
                            className="w-12 h-10 p-1 cursor-pointer"
                            disabled={formLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="#ffffff"
                            disabled={formLoading}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formEdit.control}
                  name="cardColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Color</FormLabel>
                      <div className="flex gap-2 items-center">
                        <FormControl>
                          <Input
                            type="color"
                            {...field}
                            className="w-12 h-10 p-1 cursor-pointer"
                            disabled={formLoading}
                          />
                        </FormControl>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="#ffffff"
                            disabled={formLoading}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={formEdit.control}
                name="bannerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={formLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="advertisement">
                          Advertisement
                        </SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable to show this banner on the website
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
              <SheetFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Banner"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ads
              banner "{selectedBanner?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              disabled={formLoading}
              className="bg-error-main hover:bg-error-dark"
            >
              {formLoading ? (
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
    </div>
  );
}
