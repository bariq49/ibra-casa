import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileText,
  Download,
  Share2,
  Eye,
  Package,
  Printer,
  Copy,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "@/components/invoice/InvoiceTemplate";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { formatCurrency } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;
  updatedAt: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  terms: string;
  order: Order;
}

const InvoicePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const axiosPrivate = useAxiosPrivate();

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${invoiceData?.invoiceNumber}`,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get("/orders/admin", {
        params: {
          page,
          perPage,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: debouncedSearchTerm.trim() || undefined,
        },
      });

      const fetchedOrders = response.data.orders || [];
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, axiosPrivate, page, perPage, statusFilter, debouncedSearchTerm]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearchTerm, perPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `INV-${year}${month}${day}-${random}`;
  };

  const generateInvoice = (order: Order) => {
    const invoiceNumber = generateInvoiceNumber();
    const invoiceDate = new Date().toISOString().split("T")[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const invoice: InvoiceData = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      notes: "Thank you for your business!",
      terms: "Payment due within 30 days.",
      order,
    };

    setInvoiceData(invoice);
    setIsPreviewOpen(true);
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current || !invoiceData) return;
    setIsGeneratingPdf(true);
    
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      // We briefly alter scales to get a super sharp high-res rendering
      const canvas = await html2canvas(invoiceRef.current, { 
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add the image filling exactly the A4 width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Sellzy_Invoice_${invoiceData.invoiceNumber}.pdf`);
      
      toast({
        title: "Download Complete",
        description: "Your invoice PDF was generated successfully.",
      });
    } catch (err) {
      console.error("Failed to generate scalable PDF", err);
      toast({
        title: "Download Failed",
        description: "An error occurred constructing the PDF.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const shareInvoice = (platform: string) => {
    if (!invoiceData) return;

    const shareText = `Invoice ${
      invoiceData.invoiceNumber
    } from Sellzy - Total: ${formatCurrency(invoiceData.order.totalAmount)}`;
    const shareUrl = window.location.href;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${shareText} ${shareUrl}`,
          )}`,
        );
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            shareUrl,
          )}&text=${encodeURIComponent(shareText)}`,
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText,
          )}&url=${encodeURIComponent(shareUrl)}`,
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl,
          )}`,
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl,
          )}`,
        );
        break;
      case "copy":
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
          toast({
            title: "Copied to clipboard",
            description: "Invoice details copied to clipboard",
          });
        });
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success-lighter text-success-dark";
      case "shipped":
        return "bg-info-lighter text-info-dark";
      case "confirmed":
        return "bg-primary-lighter text-primary-dark";
      case "processing":
        return "bg-warning-lighter text-warning-dark";
      case "cancelled":
        return "bg-error-lighter text-error-dark";
      default:
        return "bg-grey-100 text-grey-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Generator</h1>
          <p className="text-muted-foreground">
            Generate and manage invoices for your orders
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by Order ID, Customer Name, or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={perPage.toString()} onValueChange={(val) => setPerPage(Number(val))}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Per Page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="30">30 per page</SelectItem>
                <SelectItem value="1000">All orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 py-8">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {order._id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.paymentStatus === "paid"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            order.paymentStatus === "paid"
                              ? "bg-success-lighter text-success-dark"
                              : "bg-warning-lighter text-warning-dark"
                          }
                        >
                          {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(order.status)}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => generateInvoice(order)}
                            className="flex items-center gap-1"
                          >
                            <FileText className="h-4 w-4" />
                            Generate
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found matching your criteria
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && total > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{(page - 1) * perPage + 1}</span> to{" "}
                <span className="font-medium">{Math.min(page * perPage, total)}</span> of{" "}
                <span className="font-medium">{total}</span> orders
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-sm">
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview Dialog */}
      {invoiceData && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadPDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2"
                >
                  {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isGeneratingPdf ? "Generating..." : "Download PDF"}
                </Button>
                <Button
                  onClick={() => setIsShareDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Invoice
                </Button>
              </div>
              <div className="border border-grey-200 shadow-sm rounded-md overflow-hidden bg-white">
                <InvoiceTemplate invoiceData={invoiceData} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this invoice via social media or copy the link
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => shareInvoice("whatsapp")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => shareInvoice("telegram")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Telegram
              </Button>
              <Button
                variant="outline"
                onClick={() => shareInvoice("twitter")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => shareInvoice("facebook")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => shareInvoice("linkedin")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => shareInvoice("copy")}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsShareDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      {invoiceData && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview Invoice
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Invoice
              </Button>
              <Button
                variant="outline"
                onClick={downloadPDF}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2"
              >
                {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isGeneratingPdf ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                onClick={() => setIsShareDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Persistent Invoice Ref for perfectly isolated html2canvas/PDF actions */}
      {invoiceData && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <div ref={invoiceRef} className="bg-white">
            <InvoiceTemplate invoiceData={invoiceData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
