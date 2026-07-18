import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Award,
  ChevronDown,
  ImageIcon,
  Image as ImageIcon2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { MultiSelect } from "@/components/ui/multi-select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Switch } from "../../components/ui/switch";

interface IProductType {
  _id: string;
  name: string;
}

interface IProductBase {
  _id: string;
  title: string;
}

interface IPageBanner {
  _id: string;
  badge?: string;
  title: string;
  subTitle?: string;
  buttonTitle?: string;
  buttonHref?: string;
  buttonBg?: string;
  bannerType: IProductType[] | string[];
  bannerBase: IProductBase[] | string[];
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PageBannersPage() {
  const [banners, setBanners] = useState<IPageBanner[]>([]);
  const [productTypes, setProductTypes] = useState<IProductType[]>([]);
  const [productBases, setProductBases] = useState<IProductBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<IPageBanner | null>(
    null,
  );

  // Form State
  const [formData, setFormData] = useState({
    badge: "",
    title: "",
    subTitle: "",
    buttonTitle: "",
    buttonHref: "",
    buttonBg: "#000000",
    bannerType: [] as string[],
    bannerBase: [] as string[],
    image: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [bannersRes, typesRes, basesRes] = await Promise.all([
        axios.get("/api/page-banners", { withCredentials: true }),
        axios.get("/api/product-types", { withCredentials: true }),
        axios.get("/api/product-bases", { withCredentials: true }),
      ]);
      setBanners(
        Array.isArray(bannersRes.data)
          ? bannersRes.data
          : bannersRes.data?.pageBanners || bannersRes.data?.data || [],
      );
      setProductTypes(
        Array.isArray(typesRes.data)
          ? typesRes.data
          : typesRes.data?.productTypes || typesRes.data?.data || [],
      );
      setProductBases(
        Array.isArray(basesRes.data)
          ? basesRes.data
          : basesRes.data?.productBases || basesRes.data?.data || [],
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (banner?: IPageBanner) => {
    if (banner) {
      setSelectedBanner(banner);
      setFormData({
        badge: typeof banner.badge === "string" ? banner.badge : "",
        title: banner.title,
        subTitle: banner.subTitle || "",
        buttonTitle: banner.buttonTitle || "",
        buttonHref: banner.buttonHref || "",
        buttonBg: banner.buttonBg || "#000000",
        bannerType: banner.bannerType.map((t) =>
          typeof t === "object" ? t._id : t,
        ),
        bannerBase: banner.bannerBase.map((b) =>
          typeof b === "object" ? b._id : b,
        ),
        image: banner.image,
        isActive: banner.isActive,
      });
    } else {
      setSelectedBanner(null);
      setFormData({
        badge: "",
        title: "",
        subTitle: "",
        buttonTitle: "",
        buttonHref: "",
        buttonBg: "#000000",
        bannerType: [],
        bannerBase: [],
        image: "",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (banner: IPageBanner) => {
    setSelectedBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const url = selectedBanner
        ? `/api/page-banners/${selectedBanner._id}`
        : "/api/page-banners";
      const method = selectedBanner ? "put" : "post";

      await axios[method](url, formData, { withCredentials: true });

      toast.success(
        `Banner ${selectedBanner ? "updated" : "created"} successfully`,
      );
      fetchData();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    try {
      await axios.delete(`/api/page-banners/${selectedBanner._id}`, {
        withCredentials: true,
      });
      toast.success("Banner deleted successfully");
      fetchData();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete banner");
    }
  };

  const typeOptions = productTypes.map((t) => ({
    label: t.name,
    value: t._id,
  }));
  const baseOptions = productBases.map((b) => ({
    label: b.title,
    value: b._id,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-grey-200">
        <div>
          <h1 className="text-2xl font-bold text-grey-900">Page Banners</h1>
          <p className="text-grey-500 mt-1">
            Manage promotional banners across product catalog pages
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-grey-100 border-b border-grey-200">
                <TableRow>
                  <TableHead className="font-semibold text-grey-600">
                    Image
                  </TableHead>
                  <TableHead className="font-semibold text-grey-600">
                    Details
                  </TableHead>
                  <TableHead className="font-semibold text-grey-600">
                    Badge
                  </TableHead>
                  <TableHead className="font-semibold text-grey-600">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-semibold text-grey-600 pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-grey-500"
                    >
                      Loading banners...
                    </TableCell>
                  </TableRow>
                ) : banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-grey-500">
                        <ImageIcon className="h-12 w-12 mb-4 text-grey-300" />
                        <p className="text-lg font-medium text-grey-900">
                          No banners found
                        </p>
                        <p className="text-sm">
                          Click the add button to create your first page banner.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map((banner) => (
                    <TableRow
                      key={banner._id}
                      className="hover:bg-grey-100/50 transition-colors"
                    >
                      <TableCell>
                        <div className="h-16 w-24 rounded-lg overflow-hidden border border-grey-200 bg-grey-100 shrink-0">
                          {banner.image ? (
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon2 className="h-6 w-6 text-grey-300" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 max-w-[300px]">
                          <span className="font-medium text-grey-900 truncate">
                            {banner.title}
                          </span>
                          {banner.subTitle && (
                            <span className="text-sm text-grey-500 truncate">
                              {banner.subTitle}
                            </span>
                          )}
                          <div className="flex gap-2 text-xs text-grey-400 mt-1">
                            {banner.bannerType.length > 0 && (
                              <span className="bg-secondary-lighter text-secondary-dark px-2 py-0.5 rounded-full border border-secondary-lighter">
                                {banner.bannerType.length} Type(s)
                              </span>
                            )}
                            {banner.bannerBase.length > 0 && (
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                                {banner.bannerBase.length} Base(s)
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {banner.badge ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning-lighter text-warning-dark border border-warning-lighter">
                            {banner.badge}
                          </span>
                        ) : (
                          <span className="text-grey-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            banner.isActive
                              ? "bg-success-lighter text-success-dark border-success-lighter"
                              : "bg-grey-100 text-grey-700 border-grey-200"
                          }`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(banner)}
                            className="h-8 w-8 text-grey-500 hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(banner)}
                            className="h-8 w-8 text-grey-500 hover:text-error-main hover:bg-error-lighter"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Sidebar */}
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent className="w-full sm:max-w-[700px] p-0 overflow-y-auto bg-white sm:w-[700px]">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle className="text-xl font-semibold text-grey-900">
              {selectedBanner ? "Edit Page Banner" : "Add New Page Banner"}
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="badge"
                    className="text-sm font-medium text-grey-700"
                  >
                    Badge <span className="text-grey-400">(Optional)</span>
                  </Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    placeholder="e.g. Bestseller, New Arrival"
                    className="bg-grey-100 border-grey-200 focus-visible:ring-primary h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-grey-700"
                  >
                    Main Title <span className="text-error-main">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter banner title"
                    className="bg-grey-100 border-grey-200 focus-visible:ring-primary h-10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="subTitle"
                    className="text-sm font-medium text-grey-700"
                  >
                    Subtitle
                  </Label>
                  <Input
                    id="subTitle"
                    value={formData.subTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subTitle: e.target.value })
                    }
                    placeholder="Enter subtitle (optional)"
                    className="bg-grey-100 border-grey-200 focus-visible:ring-primary h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="buttonTitle"
                      className="text-sm font-medium text-grey-700"
                    >
                      Button Text
                    </Label>
                    <Input
                      id="buttonTitle"
                      value={formData.buttonTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buttonTitle: e.target.value,
                        })
                      }
                      placeholder="e.g. Shop Now"
                      className="bg-grey-100 border-grey-200 focus-visible:ring-primary h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="buttonHref"
                      className="text-sm font-medium text-grey-700"
                    >
                      Button Link
                    </Label>
                    <Input
                      id="buttonHref"
                      value={formData.buttonHref}
                      onChange={(e) =>
                        setFormData({ ...formData, buttonHref: e.target.value })
                      }
                      placeholder="e.g. /category/tops"
                      className="bg-grey-100 border-grey-200 focus-visible:ring-primary h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="buttonBg"
                    className="text-sm font-medium text-grey-700"
                  >
                    Button Background Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="buttonBg"
                      type="color"
                      value={formData.buttonBg}
                      onChange={(e) =>
                        setFormData({ ...formData, buttonBg: e.target.value })
                      }
                      className="w-12 h-10 p-1 cursor-pointer bg-grey-100 border-grey-200"
                    />
                    <Input
                      value={formData.buttonBg}
                      onChange={(e) =>
                        setFormData({ ...formData, buttonBg: e.target.value })
                      }
                      placeholder="#000000"
                      className="bg-grey-100 border-grey-200 focus-visible:ring-primary h-10 flex-1 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-grey-700">
                    Target Pages (Product Types)
                  </Label>
                  <MultiSelect
                    options={typeOptions}
                    selected={formData.bannerType}
                    onChange={(value) =>
                      setFormData({ ...formData, bannerType: value })
                    }
                    placeholder="Select specific Product Types..."
                  />
                  <p className="text-xs text-grey-500">
                    Leaving blank means it won't filter by type.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-grey-700">
                    Target Pages (Product Bases)
                  </Label>
                  <MultiSelect
                    options={baseOptions}
                    selected={formData.bannerBase}
                    onChange={(value) =>
                      setFormData({ ...formData, bannerBase: value })
                    }
                    placeholder="Select specific Product Bases..."
                  />
                  <p className="text-xs text-grey-500">
                    Leaving blank means it won't filter by base.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-grey-700">
                    Image Banner <span className="text-error-main">*</span>
                  </Label>
                  <div className="bg-grey-100 rounded-xl p-3 border border-grey-200 h-[180px]">
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) =>
                        setFormData({ ...formData, image: url })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-6 border-t border-grey-100">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label
                  htmlFor="isActive"
                  className="text-sm text-grey-600 cursor-pointer select-none"
                >
                  Banner Active Status
                </Label>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-white border-grey-200 hover:bg-grey-100 text-grey-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.image || !formData.title}
                  className="bg-primary hover:bg-primary/90 text-white shadow-sm min-w-[100px]"
                >
                  {isSubmitting
                    ? "Saving..."
                    : selectedBanner
                      ? "Save Changes"
                      : "Create Banner"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-grey-900">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-grey-500">
              Are you sure you want to delete the banner "
              {selectedBanner?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-grey-200 hover:bg-grey-100 text-grey-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error-main hover:bg-error-dark text-white border-0 shadow-sm"
            >
              Delete Banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
