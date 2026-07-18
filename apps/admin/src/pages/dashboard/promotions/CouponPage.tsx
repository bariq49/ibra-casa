import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import {
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Ticket,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  _id: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixedAmount";
  discountValue: number;
  minPurchaseAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function CouponPage() {
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Status check
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchaseAmount: 0,
    startDate: "",
    endDate: "",
    usageLimit: 0,
    isActive: true,
  });

  const fetchCoupons = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
      });

      if (search) params.append("search", search);

      const response = await axiosPrivate.get(
        `/coupons?${params.toString()}`
      );

      setCoupons(response.data?.coupons || []);
      setTotal(response.data?.total || 0);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch coupons" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [page, perPage]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchCoupons();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRefresh = () => {
    fetchCoupons(true);
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setSelectedCoupon(coupon);
      setFormData({
        name: coupon.name || "",
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount || 0,
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : "",
        usageLimit: coupon.usageLimit || 0,
        isActive: coupon.isActive,
      });
    } else {
      setSelectedCoupon(null);
      setFormData({
        name: "",
        code: "",
        discountType: "percentage",
        discountValue: 0,
        minPurchaseAmount: 0,
        startDate: "",
        endDate: "",
        usageLimit: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const loadDummyData = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    setFormData({
      name: `Flash Sale ${randomNum}`,
      code: `SALE${randomNum}`,
      discountType: "percentage",
      discountValue: Math.floor(Math.random() * 30) + 10,
      minPurchaseAmount: 500,
      startDate: now.toISOString().slice(0, 16),
      endDate: nextWeek.toISOString().slice(0, 16),
      usageLimit: 100,
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!formData.name || !formData.code || formData.discountValue <= 0) {
        toast({ variant: "destructive", title: "Error", description: "Please provide a valid name, code, and discount value" });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        minPurchaseAmount: formData.minPurchaseAmount || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        usageLimit: formData.usageLimit || undefined,
      };

      if (selectedCoupon) {
        await axiosPrivate.put(
          `/coupons/${selectedCoupon._id}`,
          payload
        );
        toast({ title: "Success", description: "Coupon updated successfully" });
      } else {
        await axiosPrivate.post(
          `/coupons`,
          payload
        );
        toast({ title: "Success", description: "Coupon created successfully" });
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Something went wrong" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    try {
      setIsSubmitting(true);
      await axiosPrivate.delete(
        `/coupons/${selectedCoupon._id}`
      );
      toast({ title: "Success", description: "Coupon deleted successfully" });
      setIsDeleteModalOpen(false);
      fetchCoupons();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete coupon" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-grey-900 font-['DM_Sans',sans-serif]">
            Coupons
          </h1>
          <p className="text-sm text-grey-500 mt-1 font-['Outfit',sans-serif]">
            Create and manage discount codes, active deals, and limits.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden lg:flex flex-col bg-[#F8F9FA] px-3 py-1 rounded-md border border-border/50 mr-2 shrink-0">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider font-['DM_Sans',sans-serif]">Total</span>
            <span className="text-sm font-bold text-foreground font-['DM_Sans',sans-serif] leading-tight text-center">{total}</span>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none justify-center h-10 bg-primary-main hover:bg-primary-main/90 text-white shadow-sm font-['DM_Sans',sans-serif] text-sm px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Coupon</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary-main transition-colors" />
          <Input
            placeholder="Search by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 w-full bg-[#F8F9FA] border-[#E9ECEF] focus-visible:ring-primary-main/20 focus-visible:border-primary-main transition-all font-['DM_Sans',sans-serif] text-sm shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-10 w-10 bg-white border-[#E9ECEF] hover:bg-[#F8F9FA] shadow-sm shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-primary-main" : "text-[#495057]"}`} />
          </Button>
          <Select value={perPage.toString()} onValueChange={(val) => setPerPage(Number(val))}>
            <SelectTrigger className="h-10 w-[110px] bg-white border-[#E9ECEF] font-['DM_Sans',sans-serif] text-sm shadow-sm">
              <SelectValue placeholder="Per Page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / Page</SelectItem>
              <SelectItem value="25">25 / Page</SelectItem>
              <SelectItem value="50">50 / Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-[#E9ECEF] bg-white shadow-sm overflow-hidden">
        {loading && (!coupons || coupons.length === 0) ? (
          <div className="p-12 text-center row-span-full">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-main mx-auto mb-4" />
            <p className="text-grey-500 font-['Outfit',sans-serif]">Loading coupons...</p>
          </div>
        ) : !coupons || coupons.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-6">
              <Ticket className="h-8 w-8 text-[#ADB5BD]" />
            </div>
            <h3 className="text-lg font-bold text-grey-900 mb-2 font-['DM_Sans',sans-serif]">No coupons found</h3>
            <p className="text-grey-500 max-w-sm font-['Outfit',sans-serif]">
              {search ? "We couldn't find any coupons matching your search." : "You haven't created any coupons yet. Get started to run promotions."}
            </p>
            {search && (
              <Button variant="link" onClick={() => setSearch("")} className="mt-4 text-primary-main">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-[#F8F9FA]/80 border-b border-[#E9ECEF]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-[#495057] font-['DM_Sans',sans-serif] h-12 w-[180px]">Name</TableHead>
                  <TableHead className="font-bold text-[#495057] font-['DM_Sans',sans-serif] h-12">Code</TableHead>
                  <TableHead className="font-bold text-[#495057] font-['DM_Sans',sans-serif] h-12">Discount</TableHead>
                  <TableHead className="font-bold text-[#495057] font-['DM_Sans',sans-serif] h-12">Usage</TableHead>
                  <TableHead className="font-bold text-[#495057] font-['DM_Sans',sans-serif] h-12">Limits</TableHead>
                  <TableHead className="font-bold text-[#495057] font-['DM_Sans',sans-serif] h-12">Status</TableHead>
                  <TableHead className="font-bold text-[#495057] font-['DM_Sans',sans-serif] h-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id} className="hover:bg-[#F8F9FA]/50 border-b border-[#E9ECEF]/50 transition-colors">
                    <TableCell className="font-semibold text-grey-900 font-['DM_Sans',sans-serif]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary-main/10 rounded-md">
                          <Ticket className="h-4 w-4 text-primary-main" />
                        </div>
                        {coupon.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-grey-700 font-['Outfit',sans-serif]">
                      {coupon.code}
                    </TableCell>
                    <TableCell className="font-medium text-grey-700 font-['Outfit',sans-serif]">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                    </TableCell>
                    <TableCell className="font-medium text-grey-600 font-['Outfit',sans-serif]">
                      {coupon.usedCount} times
                    </TableCell>
                    <TableCell className="text-sm text-grey-500 font-['Outfit',sans-serif]">
                      <div className="flex flex-col">
                        <span>Min: {coupon.minPurchaseAmount ? `৳${coupon.minPurchaseAmount}` : 'None'}</span>
                        <span>Max usage: {coupon.usageLimit || 'Unlimited'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="mr-1 h-3 w-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <XCircle className="mr-1 h-3 w-3" /> Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(coupon)}
                          className="hover:bg-info-lighter"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-info-main" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedCoupon(coupon); setIsDeleteModalOpen(true); }}
                          className="hover:bg-error-lighter"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-error-main" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Write Modals */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent className="sm:max-w-[500px] p-0 overflow-y-auto font-['DM_Sans',sans-serif]">
          <SheetHeader className="p-6 pb-4 border-b border-border bg-[#F8F9FA] flex flex-row items-center justify-between">
            <SheetTitle className="text-xl font-bold font-['DM_Sans',sans-serif] mt-0">
              {selectedCoupon ? "Edit Coupon" : "Create New Coupon"}
            </SheetTitle>
            {!selectedCoupon && (
              <Button onClick={loadDummyData} size="sm" variant="outline" className="h-8 gap-1.5 border-primary-main/20 text-primary-main hover:bg-primary-main/5 mt-0!">
                <Wand2 className="h-3.5 w-3.5" />
                Fill Dummy Data
              </Button>
            )}
          </SheetHeader>
          
          <div className="p-6 flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold text-grey-700">Coupon Name (Unique)</Label>
              <Input
                id="name"
                placeholder="e.g. Summer Sale 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#F8F9FA] font-medium"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code" className="text-sm font-semibold text-grey-700">Coupon Code</Label>
              <Input
                id="code"
                placeholder="e.g. SUMMER50"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="uppercase bg-[#F8F9FA] font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-grey-700">Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                >
                  <SelectTrigger className="bg-[#F8F9FA]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixedAmount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discountValue" className="text-sm font-semibold text-grey-700">Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  className="bg-[#F8F9FA]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="minPurchase" className="text-sm font-semibold text-grey-700">Min Purchase Amt</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  min="0"
                  placeholder="0 for none"
                  value={formData.minPurchaseAmount}
                  onChange={(e) => setFormData({ ...formData, minPurchaseAmount: Number(e.target.value) })}
                  className="bg-[#F8F9FA]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usageLimit" className="text-sm font-semibold text-grey-700">Overall Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="0"
                  placeholder="0 for unlimited"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  className="bg-[#F8F9FA]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="startDate" className="text-sm font-semibold text-grey-700">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-[#F8F9FA]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate" className="text-sm font-semibold text-grey-700">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-[#F8F9FA]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 mt-2 border rounded-xl bg-grey-50 border-grey-100">
              <div className="space-y-1">
                <Label className="font-semibold text-grey-900">Active Status</Label>
                <p className="text-sm text-grey-500 font-['Outfit',sans-serif]">Allow customers to use this coupon.</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                className="data-[state=checked]:bg-primary-main"
              />
            </div>
          </div>

          <SheetFooter className="p-6 pt-4 border-t border-border bg-[#F8F9FA]/50 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary-main hover:bg-primary-main/90 text-white font-semibold shadow-sm"
            >
              {isSubmitting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : selectedCoupon ? (
                "Save Changes"
              ) : (
                "Create Coupon"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
          </DialogHeader>
          <p className="text-grey-500 font-['Outfit',sans-serif]">
            Are you sure you want to delete the coupon{" "}
            <strong>{selectedCoupon?.code}</strong>? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-error-main hover:bg-error-main/90"
            >
              {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
