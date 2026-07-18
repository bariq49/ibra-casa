import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

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

interface InvoiceTemplateProps {
  invoiceData: InvoiceData;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoiceData }) => {
  const { order } = invoiceData;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="Sellzy" className="h-12 w-auto object-contain" />
          </div>
          <div className="text-sm text-grey-600">
            <p>123 Commerce Avenue</p>
            <p>Tech District, NY 10001</p>
            <p>support@reactbd.com</p>
            <p>+1 (800) 123-SELL</p>
          </div>
        </div>
        <div className="text-right space-y-2">
          <h2 className="text-2xl font-bold text-grey-800">INVOICE</h2>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Invoice #:</span>{" "}
              {invoiceData.invoiceNumber}
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {new Date(invoiceData.invoiceDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Due Date:</span>{" "}
              {new Date(invoiceData.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To and Order Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-grey-800 mb-3">Bill To:</h3>
          <div className="space-y-1">
            <p className="font-medium text-grey-800">{order.user?.name || "Valued Customer"}</p>
            {order.user?.email && <p className="text-grey-600">{order.user.email}</p>}
            <div className="text-grey-600 mt-1">
              {order.shippingAddress ? (
                <>
                  <p>{order.shippingAddress.street || "Unknown Street"}</p>
                  <p>
                    {order.shippingAddress.city || "Unknown City"}, {order.shippingAddress.zipCode || ""}
                  </p>
                  <p>{order.shippingAddress.country || ""}</p>
                </>
              ) : (
                <p className="italic text-grey-400">No shipping address provided</p>
              )}
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-grey-800 mb-3">
            Order Details:
          </h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Order ID:</span> {order._id}
            </p>
            <p>
              <span className="font-medium">Order Date:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p>
              <span className="font-medium">Payment Method:</span> Credit Card
            </p>
            <div className="flex items-center gap-2">
              <span className="font-medium">Payment Status:</span>
              <Badge
                variant={
                  order.paymentStatus === "paid" ? "default" : "secondary"
                }
                className={
                  order.paymentStatus === "paid"
                    ? "bg-success-lighter text-success-dark border-success-lighter"
                    : "bg-warning-lighter text-warning-dark border-warning-lighter"
                }
              >
                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-grey-300">
          <thead>
            <tr className="bg-grey-100">
              <th className="border border-grey-300 px-4 py-3 text-left font-medium text-grey-800">
                Item Description
              </th>
              <th className="border border-grey-300 px-4 py-3 text-center font-medium text-grey-800">
                Quantity
              </th>
              <th className="border border-grey-300 px-4 py-3 text-right font-medium text-grey-800">
                Unit Price
              </th>
              <th className="border border-grey-300 px-4 py-3 text-right font-medium text-grey-800">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: OrderItem, index: number) => (
              <tr key={index} className="hover:bg-grey-100">
                <td className="border border-grey-300 px-4 py-3 text-grey-800">
                  {item.product.name}
                </td>
                <td className="border border-grey-300 px-4 py-3 text-center text-grey-800">
                  {item.quantity}
                </td>
                <td className="border border-grey-300 px-4 py-3 text-right text-grey-800">
                  {formatCurrency(item.price)}
                </td>
                <td className="border border-grey-300 px-4 py-3 text-right text-grey-800">
                  {formatCurrency(item.quantity * item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-grey-600">Subtotal:</span>
              <span className="text-grey-800">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-grey-600">Tax:</span>
              <span className="text-grey-800">{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-grey-600">Shipping:</span>
              <span className="text-grey-800">{formatCurrency(0)}</span>
            </div>
            <div className="border-t border-grey-300 pt-2">
              <div className="flex justify-between py-2 text-lg font-bold">
                <span className="text-grey-800">Total:</span>
                <span className="text-grey-800">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="space-y-4">
        <div className="bg-grey-100 p-4 rounded-lg">
          <h4 className="font-semibold text-grey-800 mb-2">Notes:</h4>
          <p className="text-grey-600 text-sm">{invoiceData.notes}</p>
        </div>
        <div className="bg-grey-100 p-4 rounded-lg">
          <h4 className="font-semibold text-grey-800 mb-2">
            Terms & Conditions:
          </h4>
          <p className="text-grey-600 text-sm">{invoiceData.terms}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-grey-300 text-center text-sm text-grey-500">
        <p>Thank you for choosing Sellzy!</p>
        <p>Your premium e-commerce destination</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
