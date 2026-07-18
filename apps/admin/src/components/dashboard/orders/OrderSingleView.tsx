import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Download,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import useAuthStore from "@/store/useAuthStore";
import { formatCurrency } from "@/lib/utils";

interface OrderSingleViewProps {
  order: any;
  onBack: () => void;
  onEdit?: () => void;
}

export default function OrderSingleView({
  order,
  onBack,
  onEdit,
}: OrderSingleViewProps) {
  const { user } = useAuthStore();
  const isPreviewRole = user?.role === "preview";

  // Safe fallbacks for missing data
  const items = order?.items || [];
  const createdAt = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

  // Try to find if order actually has a delivered date
  const deliveredEntry = order?.status_history?.find(
    (h: any) => h.status === "delivered",
  );
  const deliveryDate = deliveredEntry?.changed_at
    ? new Date(deliveredEntry.changed_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Pending";

  const customer = order?.user || {};
  const address = order?.shippingAddress || {};
  const statusHistory = order?.status_history || [];

  // Calculate totals natively
  const subTotal = items.reduce(
    (sum: number, item: any) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );
  const taxAmount = Number(order?.taxAmount || 0);
  const discountAmount = Number(order?.discountAmount || 0);
  const shippingAmount = Number(order?.shippingAmount || 0);
  const finalTotal = Number(order?.totalAmount || order?.total || subTotal);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const orderId = order?.orderId || order?._id?.substring(0, 8);

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("INVOICE", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: #${orderId}`, 14, 30);
    doc.text(`Date: ${createdAt}`, 14, 35);
    doc.text(`Status: ${order?.status?.replace("_", " ")}`, 14, 40);
    doc.text(`Payment: ${order?.paymentStatus || "Paid"}`, 14, 45);

    // Customer Info (Right side aligned)
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 130, 30);
    doc.setFont("helvetica", "normal");
    doc.text(customer.name || "Customer", 130, 35);
    doc.text(customer.email || "", 130, 40);
    doc.text(customer.phone || "", 130, 45);

    // Address
    doc.setFont("helvetica", "bold");
    doc.text("Shipping Address:", 14, 60);
    doc.setFont("helvetica", "normal");
    const addr = `${address.street || ""}, ${address.city || ""} ${address.zipCode || ""}`;
    doc.text(addr, 14, 65);
    doc.text(address.country || "", 14, 70);

    // Divider
    doc.setLineWidth(0.2);
    doc.line(14, 80, 196, 80);

    // Table Header
    let y = 90;
    doc.setFont("helvetica", "bold");
    doc.text("Item", 14, y);
    doc.text("Qty", 120, y);
    doc.text("Price", 150, y);
    doc.text("Total", 180, y);

    doc.line(14, y + 2, 196, y + 2);
    y += 10;
    doc.setFont("helvetica", "normal");

    // Items
    items.forEach((item: any) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const itemName = String(item.product?.name || "Product").substring(0, 40);
      const qtyStr = String(item.quantity);
      const priceStr = formatCurrency(Number(item.price));
      const totalStr = formatCurrency(Number(item.price) * Number(item.quantity));

      doc.text(itemName, 14, y);
      doc.text(qtyStr, 120, y);
      doc.text(priceStr, 150, y);
      doc.text(totalStr, 180, y);
      y += 8;
    });

    // Summary Box
    doc.line(120, y + 5, 196, y + 5);
    y += 15;

    doc.text("Sub-total:", 140, y);
    doc.text(formatCurrency(subTotal), 180, y);
    y += 7;

    if (taxAmount > 0) {
      doc.text("Tax:", 140, y);
      doc.text(formatCurrency(taxAmount), 180, y);
      y += 7;
    }

    if (discountAmount > 0) {
      doc.text("Discount:", 140, y);
      doc.text(`-${formatCurrency(discountAmount)}`, 180, y);
      y += 7;
    }

    doc.text("Shipping:", 140, y);
    doc.text(
      shippingAmount > 0 ? formatCurrency(shippingAmount) : "Free",
      180,
      y,
    );
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Total:", 140, y);
    doc.text(formatCurrency(finalTotal), 180, y);

    // Save
    doc.save(`Order_${orderId}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full shadow-sm bg-white border"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="rounded-full px-6 shadow-sm border-gray-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800 font-semibold border-none"
            disabled={isPreviewRole}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              onClick={onEdit}
              className="rounded-full px-6 shadow-sm border-gray-200"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Details & Customer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm shadow-gray-100">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4">Order Information</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-gray-900">
                      #{order?.orderId || order?._id?.substring(0, 8)}
                    </span>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="border-teal-200 text-teal-700 bg-teal-50 rounded-full px-3 py-1 font-medium capitalize"
                      >
                        {order?.paymentStatus || "Paid"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-indigo-200 text-indigo-700 bg-indigo-50 rounded-full px-3 py-1 font-medium capitalize"
                      >
                        {order?.status?.replace("_", " ") || "Delivered"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Blocks */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Order Date
                  </p>
                  <p className="font-bold text-gray-900">{createdAt}</p>
                </div>
                <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100/50">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Total Items
                  </p>
                  <p className="font-bold text-gray-900">
                    {items.length} items
                  </p>
                </div>
                <div className="bg-lime-50/50 p-4 rounded-xl border border-lime-100/50">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Delivery Date
                  </p>
                  <p className="font-bold text-gray-900">{deliveryDate}</p>
                </div>
              </div>

              {/* Products Table */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow className="border-gray-100 hover:bg-transparent">
                      <TableHead className="py-4 font-semibold text-gray-600">
                        Product Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600">
                        Category
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600">
                        Items
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600 text-right">
                        Price
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item: any, i: number) => (
                      <TableRow
                        key={i}
                        className="border-gray-100 hover:bg-gray-50/50"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border">
                              {item.product?.image ? (
                                <img
                                  src={item.product?.image}
                                  alt={item.product?.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <UserIcon className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-900">
                                {item.product?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ID: #{item.product?._id?.substring(0, 6)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {item.product?.category || "General"}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm font-medium">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm font-medium text-right">
                          {formatCurrency(Number(item.price))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="border-none shadow-sm shadow-gray-100">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-6">Customer Information</h2>
              <div className="flex flex-col md:flex-row items-start md:items-center p-4 bg-gray-50 rounded-xl gap-6 border border-gray-100">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-gray-500 font-bold border-2 border-white shadow-sm">
                    {customer.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Customer
                    </p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{customer.phone || "(Not provided)"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {address.street || "Unknown address"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Tracking */}
          <Card className="border-none shadow-sm shadow-gray-100">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-6">Order Tracking</h2>
              <div className="pl-2">
                <div className="relative border-l-2 border-primary/20 space-y-8 pb-4">
                  {statusHistory.length > 0 ? (
                    statusHistory.map((history: any, idx: number) => {
                      const isLast = idx === statusHistory.length - 1;
                      return (
                        <div key={idx} className="relative pl-8">
                          <div
                            className={`absolute -left-[11px] top-1 p-0.5 rounded-full bg-white`}
                          >
                            {isLast ? (
                              <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-gray-300" />
                            )}
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p
                                className={`font-bold ${isLast ? "text-gray-900" : "text-gray-500"} text-sm capitalize`}
                              >
                                Order is {history.status.replace("_", " ")}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Confirmed by{" "}
                                {history.changed_by?.name || "System"}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {new Date(history.changed_at).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="relative pl-8">
                      <div className="absolute -left-[11px] top-1 p-0.5 rounded-full bg-white">
                        <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10" />
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 text-sm capitalize">
                            Order is{" "}
                            {order?.status?.replace("_", " ") || "Pending"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Confirmed by System
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {createdAt}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card
            className="border-none shadow-sm overflow-hidden"
            style={{ backgroundColor: "#FCF7D3" }}
          >
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-6 text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-2 border-b border-black/5">
                  <span className="text-gray-700 font-medium text-sm">
                    Sub-Total
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(subTotal)}
                  </span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-black/5">
                    <span className="text-gray-700 font-medium text-sm">
                      Tax
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-black/5">
                    <span className="text-gray-700 font-medium text-sm">
                      Discount
                    </span>
                    <span className="font-bold text-gray-900">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-black/5">
                  <span className="text-gray-700 font-medium text-sm">
                    Shipment
                  </span>
                  <span className="font-bold text-gray-900">
                    {shippingAmount > 0
                      ? formatCurrency(shippingAmount)
                      : "Free"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900 font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-gray-900">
                  {formatCurrency(finalTotal)}
                </span>
              </div>

              <Button
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border font-semibold py-6 rounded-xl shadow-sm text-sm"
                onClick={() => window.print()}
                disabled={isPreviewRole}
              >
                Print Invoice
                <svg
                  className="ml-2 h-4 w-4 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
