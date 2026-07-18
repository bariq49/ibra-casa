import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  Eye,
  RefreshCw,
  ShoppingCart,
  Calendar,
  User,
  Mail,
  Box,
  Bell,
  Send,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

type CartItem = {
  productId: {
    _id: string;
    name: any;
    price: number;
    image?: string;
    slug?: string;
  };
  quantity: number;
  _id?: string;
};

type AbandonedCart = {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  lastActive: string;
};

export default function AbandonedCartPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [interval, setInterval] = useState("7days");

  // Selection
  const [selectedCarts, setSelectedCarts] = useState<Set<string>>(new Set());

  // Sheet / Drawer
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCartDetails, setSelectedCartDetails] =
    useState<AbandonedCart | null>(null);

  // Notification Modal
  const [isNotificationSheetOpen, setIsNotificationSheetOpen] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  const [notificationHistory, setNotificationHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showFormOverride, setShowFormOverride] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [notificationForm, setNotificationForm] = useState({
    title: "Don't forget your cart items!",
    message:
      "You left some amazing items in your cart. Complete your purchase now easily.",
    actionText: "Checkout Now",
    actionUrl: "/checkout",
    type: "abandoned_cart",
  });

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  // Preview role removed in production. Constant kept to avoid touching every callsite.
  void user;
  const isPreviewRole = false;

  const fetchCarts = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
        interval,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await axiosPrivate.get(`/cart/abandoned?${params}`);

      setCarts(response.data.abandonedCarts || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setCurrentPage(page);

      if (isRefresh) {
        toast({
          title: "Success",
          description: "Abandoned carts refreshed",
        });
      }
    } catch (error) {
      console.error("Failed to load abandoned carts", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load abandoned carts",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Debounced Search & Filter Effect
  const prevSearch = useRef(searchTerm);
  const prevInterval = useRef(interval);
  const prevPerPage = useRef(perPage);

  useEffect(() => {
    if (
      prevSearch.current === searchTerm &&
      prevInterval.current === interval &&
      prevPerPage.current === perPage
    ) {
      return;
    }

    prevSearch.current = searchTerm;
    prevInterval.current = interval;
    prevPerPage.current = perPage;

    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchCarts(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, interval, perPage]);

  // Initial Fetch
  useEffect(() => {
    fetchCarts(1);
  }, []);

  const handleRefresh = () => {
    fetchCarts(currentPage, true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCarts(new Set(carts.map((c) => c._id)));
    } else {
      setSelectedCarts(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedCarts);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedCarts(newSelected);
  };

  const handleViewCartDetails = (cart: AbandonedCart) => {
    setSelectedCartDetails(cart);
    setIsSheetOpen(true);
  };

  const fetchNotificationHistory = async (userId: string) => {
    try {
      setIsLoadingHistory(true);
      const response = await axiosPrivate.get(
        `/notifications/admin/history/${userId}?type=abandoned_cart`,
      );
      if (response.data.success) {
        setNotificationHistory(response.data.history);
      }
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleOpenNotification = (cart: AbandonedCart) => {
    setSelectedCartDetails(cart);
    setIsNotificationSheetOpen(true);
    setShowFormOverride(false);
    setNotificationHistory([]);
    fetchNotificationHistory(cart._id);
  };

  const handleSendNotification = async () => {
    if (!selectedCartDetails) return;
    try {
      setSendingNotification(true);
      await axiosPrivate.post("/notifications/admin/bulk-send", {
        ...notificationForm,
        userIds: [selectedCartDetails._id],
        targetAudience: "specific",
        priority: "high",
      });
      toast({
        title: "Success",
        description:
          "Notification sent successfully to " +
          selectedCartDetails.customerName,
      });

      // Refresh history and show the history view
      await fetchNotificationHistory(selectedCartDetails._id);
      setShowFormOverride(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification",
      });
    } finally {
      setSendingNotification(false);
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    try {
      await axiosPrivate.delete(`/notifications/admin/history/${notifId}`);
      toast({
        title: "Deleted",
        description: "Notification removed from history",
      });
      if (selectedCartDetails) {
        fetchNotificationHistory(selectedCartDetails._id);
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notification",
      });
    }
  };

  const handleResetHistory = async () => {
    if (!selectedCartDetails) return;
    try {
      await axiosPrivate.delete(
        `/notifications/admin/history/user/${selectedCartDetails._id}?type=abandoned_cart`,
      );
      toast({
        title: "Reset",
        description: "All notification history cleared for this user",
      });
      setNotificationHistory([]);
      setShowFormOverride(true);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset history",
      });
    }
  };

  // Extract translation name safely
  const getProductName = (name: any) => {
    if (typeof name === "string") return name;
    return name?.en || "Unknown Product";
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] w-full mb-8">
      {/* Sellzy Page Global Container matching Orders/Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white rounded-[16px] border border-grey-100 shadow-sm flex flex-col min-h-[70vh]"
      >
        {/* Header - Matches the Figma Design exactly */}
        <div className="flex flex-col gap-6 p-6 pb-4 border-b border-grey-100">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-bold text-[#212529] font-['DM_Sans']">
              Abandoned cart
            </h1>
            <Button
              className="bg-[#088178] hover:bg-[#088178]/90 text-white rounded-[100px] px-4 py-1 h-auto text-[13px] font-bold"
              disabled={isPreviewRole}
            >
              Export
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="bg-[#f9fafb] border border-[rgba(145,158,171,0.2)] flex items-center px-4 rounded-[100px] w-[300px] h-10 overflow-hidden">
              <Search className="h-[14px] w-[14px] text-[#919eab] shrink-0" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-[16px] text-[#919eab] h-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-10 rounded-[100px] px-4 border-[rgba(145,158,171,0.2)] bg-[#f9fafb] text-[#212529]"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="w-auto min-w-[120px] h-10 rounded-[100px] bg-[#f9fafb] border-[rgba(145,158,171,0.2)] text-[12px] text-[#212529] font-normal">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live (24h)</SelectItem>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="10days">10 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="all">All Carts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 w-full overflow-x-auto pb-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f9fafb] border-y border-[rgba(145,158,171,0.2)]">
                <TableHead className="font-semibold text-[#212529] w-12 rounded-tl-[8px]">
                  <Checkbox
                    checked={
                      carts.length > 0 && selectedCarts.size === carts.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="font-semibold text-[#212529]">
                  ID
                </TableHead>
                <TableHead className="font-semibold text-[#212529]">
                  Customer
                </TableHead>
                <TableHead className="font-semibold text-[#212529]">
                  Items
                </TableHead>
                <TableHead className="font-semibold text-[#212529]">
                  Amount
                </TableHead>
                <TableHead className="font-semibold text-[#212529]">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-[#212529] text-right rounded-tr-[8px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-grey-400 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : carts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-grey-500"
                  >
                    No abandoned carts found.
                  </TableCell>
                </TableRow>
              ) : (
                carts.map((cart) => (
                  <TableRow
                    key={cart._id}
                    className="hover:bg-grey-50 border-b border-[rgba(145,158,171,0.2)] h-[60px]"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedCarts.has(cart._id)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(cart._id, checked as boolean)
                        }
                        aria-label={`Select cart ${cart._id}`}
                      />
                    </TableCell>
                    <TableCell className="text-[#495057] font-normal text-[14px]">
                      #{cart._id.slice(-5)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {cart.customerAvatar ? (
                          <img
                            src={cart.customerAvatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-full border border-grey-200 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-grey-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-grey-500" />
                          </div>
                        )}
                        <span className="text-[#495057] font-normal text-[14px]">
                          {cart.customerName || "Guest"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#495057] font-normal text-[14px]">
                      {cart.totalQuantity} pcs
                    </TableCell>
                    <TableCell className="text-[#495057] font-normal text-[14px]">
                      {formatCurrency(cart.totalAmount)}
                    </TableCell>
                    <TableCell className="text-[#495057] font-normal text-[14px]">
                      {cart.lastActive
                        ? format(new Date(cart.lastActive), "dd MMM, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenNotification(cart)}
                          title="Send Notification"
                          className="h-8 w-8 text-[#919eab] hover:text-blue-600 hover:bg-blue-50/50"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCartDetails(cart)}
                          title="View Cart"
                          className="h-8 w-8 text-[#919eab] hover:text-[#088178] hover:bg-[#088178]/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-end px-6 py-4 mt-auto border-t border-[rgba(145,158,171,0.2)]">
            <Pagination className="justify-end w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className="h-9 w-9 p-0"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) fetchCarts(currentPage - 1);
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <PaginationItem>
                          <span className="px-2">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={p === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            if (p !== currentPage) fetchCarts(p);
                          }}
                          className={`rounded-full h-10 w-10 font-semibold ${
                            p === currentPage
                              ? "bg-[rgba(0,171,85,0.12)] text-[#088178] hover:bg-[rgba(0,171,85,0.2)]"
                              : "text-[#212529] opacity-50 hover:opacity-100"
                          }`}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    className="h-9 w-9 p-0"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) fetchCarts(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </motion.div>

      {/* Cart Details Sidebar (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[450px]">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#088178]" />
              Cart Details
            </SheetTitle>
            <SheetDescription>
              Viewing abandoned cart for{" "}
              {selectedCartDetails?.customerName || "Customer"}
            </SheetDescription>
          </SheetHeader>

          {selectedCartDetails && (
            <div className="flex flex-col gap-6">
              {/* Customer Info Card */}
              <div className="bg-grey-50 border border-grey-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-3 text-grey-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-grey-500" />
                  Customer Information
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  {selectedCartDetails.customerAvatar ? (
                    <img
                      src={selectedCartDetails.customerAvatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full bg-white border border-grey-200 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-grey-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-grey-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-grey-900 text-sm">
                      {selectedCartDetails.customerName}
                    </h4>
                    <p className="text-sm text-grey-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {selectedCartDetails.customerEmail}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-grey-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last specific activity:{" "}
                  {selectedCartDetails.lastActive
                    ? format(
                        new Date(selectedCartDetails.lastActive),
                        "PPP 'at' p",
                      )
                    : "Unknown"}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-grey-900 flex items-center gap-2">
                  <Box className="w-4 h-4 text-grey-500" />
                  Cart Items ({selectedCartDetails.totalQuantity})
                </h3>
                <div className="flex flex-col gap-4">
                  {selectedCartDetails.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 items-center border-b border-grey-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="w-12 h-12 bg-grey-50 rounded-md border border-grey-100 flex items-center justify-center overflow-hidden shrink-0">
                        {item.productId.image ? (
                          <img
                            src={item.productId.image}
                            alt={getProductName(item.productId.name)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Box className="w-5 h-5 text-grey-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-grey-900 truncate">
                          {getProductName(item.productId.name)}
                        </p>
                        <p className="text-xs text-grey-500">
                          Qty: {item.quantity} x {formatCurrency(item.productId.price)}
                        </p>
                      </div>
                      <div className="font-semibold text-sm text-grey-900">
                        {formatCurrency(item.productId.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-[#f9fafb] border border-[#088178]/20 rounded-xl p-4 mt-2">
                <div className="flex items-center justify-between text-base font-bold text-grey-900">
                  <span>Estimated Total</span>
                  <span className="text-[#088178]">
                    {formatCurrency(selectedCartDetails.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Notification Sidebar (Sheet) */}
      <Sheet
        open={isNotificationSheetOpen}
        onOpenChange={setIsNotificationSheetOpen}
      >
        <SheetContent className="overflow-y-auto sm:max-w-[450px]">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#088178]" />
              {notificationHistory.length > 0 && !showFormOverride
                ? "Notification History"
                : "Send Notification"}
            </SheetTitle>
            <SheetDescription>
              {notificationHistory.length > 0 && !showFormOverride
                ? `History of messages sent to ${selectedCartDetails?.customerName || "Customer"}`
                : `Sending a direct notification to ${selectedCartDetails?.customerName || "Customer"}`}
            </SheetDescription>
          </SheetHeader>

          {isLoadingHistory ? (
            <div className="flex justify-center items-center py-10">
              <RefreshCw className="w-6 h-6 animate-spin text-grey-400" />
            </div>
          ) : notificationHistory.length > 0 && !showFormOverride ? (
            <div className="flex flex-col gap-4 mt-4 h-full relative">
              <div className="flex flex-col gap-3">
                {notificationHistory.map((notif: any, i: number) => (
                  <div
                    key={i}
                    className="border border-grey-100 bg-white rounded-lg p-4 shadow-xs relative group"
                  >
                    <button
                      onClick={() => handleDeleteNotification(notif._id)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="font-semibold text-grey-900 text-sm mb-1 pr-8">
                      {notif.title}
                    </p>
                    <p className="text-sm text-grey-600 mb-3">
                      {notif.message}
                    </p>
                    {notif.actionUrl && (
                      <p className="text-xs text-blue-600 mb-2 truncate bg-grey-50 p-1 w-max rounded">
                        Link: {notif.actionUrl}
                      </p>
                    )}
                    <p className="text-[11px] text-grey-400 font-medium pt-2 border-t border-grey-50 flex items-center justify-between">
                      <span>Sent by: {notif.senderId?.name || "Admin"}</span>
                      <span>
                        {notif.createdAt
                          ? format(
                              new Date(notif.createdAt),
                              "dd MMM yyyy, h:mm a",
                            )
                          : ""}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFormOverride(true)}
                  className="flex-1 h-11 text-[#088178] border-[#088178] hover:bg-[#088178]/5 transition-all rounded-[100px] font-bold"
                >
                  <Send className="w-4 h-4 mr-2" /> Send Another
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(true)}
                  className="h-11 px-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all rounded-[100px]"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {showResetConfirm && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-200 p-6 text-center rounded-lg">
                  <div className="bg-red-50 p-4 rounded-full mb-4">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-grey-900 mb-2">
                    Reset Notification History?
                  </h3>
                  <p className="text-sm text-grey-500 mb-6">
                    This will permanently delete all notification records sent
                    to this user regarding their abandoned cart. This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 rounded-[100px] h-11 border-grey-200 text-grey-600 hover:bg-grey-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setShowResetConfirm(false);
                        handleResetHistory();
                      }}
                      className="flex-1 rounded-[100px] h-11 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    >
                      Yes, Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5 mt-4">
              {notificationHistory.length > 0 && showFormOverride && (
                <div className="-mb-2">
                  <Button
                    variant="link"
                    onClick={() => setShowFormOverride(false)}
                    className="p-0 h-auto text-[#088178] hover:text-[#088178]/80 font-medium no-underline hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to History
                  </Button>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-grey-900">
                  Notification Title
                </label>
                <Input
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Title..."
                  className="bg-grey-50 border-grey-200"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-grey-900">
                  Message Content
                </label>
                <Textarea
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      message: e.target.value,
                    })
                  }
                  placeholder="Write your message here..."
                  className="bg-grey-50 border-grey-200 min-h-[120px] resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-grey-900">
                  Action Button Text
                </label>
                <Input
                  value={notificationForm.actionText}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      actionText: e.target.value,
                    })
                  }
                  placeholder="e.g. View Cart"
                  className="bg-grey-50 border-grey-200"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-grey-900">
                  Action Link (URL)
                </label>
                <Input
                  value={notificationForm.actionUrl}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      actionUrl: e.target.value,
                    })
                  }
                  placeholder="/path"
                  className="bg-grey-50 border-grey-200"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={handleSendNotification}
                  disabled={sendingNotification}
                  className="w-full bg-[#088178] hover:bg-[#088178]/90 text-white rounded-[100px] h-12 text-[15px] font-bold shadow-sm flex items-center justify-center gap-2"
                >
                  {sendingNotification ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sendingNotification ? "Sending..." : "Send Notification"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
