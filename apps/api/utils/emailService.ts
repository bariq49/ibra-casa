import { createTransport, Transporter } from "nodemailer";
import { IOrder, IUser } from "../types/index.js";

const BRAND = {
  name: "Ibra Casa",
  lime: "#E2FFB4",
  dark: "#1B1F23",
  muted: "#495057",
  softBg: "#F5F5F6",
  border: "#E2E2E4",
  white: "#FFFFFF",
  supportEmail: "support@ibracasa.com",
};

// Create transporter for sending emails with App Password
const createTransporter = (): Transporter => {
  return createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.SENDER_EMAIL_ADDRESS,
      pass: process.env.SMTP_PASS,
    },
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

/** Short display order ID (last 8 chars), matches storefront success / tracking pages. */
const formatOrderDisplayId = (orderId: string | { toString(): string }): string => {
  const id = String(orderId);
  return id.substring(Math.max(0, id.length - 8)).toUpperCase();
};

const brandFrom = () =>
  `"${BRAND.name}" <${
    process.env.SENDER_EMAIL_ADDRESS || "noor.jsdivs@gmail.com"
  }>`;

// Generate beautiful HTML email template
const generateOrderEmailHTML = (userName: string, order: IOrder): string => {
  const isDelivered = order.status === "delivered";
  const emailTitle = isDelivered ? "Order Delivered" : "Order Confirmation";
  const displayOrderId = formatOrderDisplayId(order._id);
  const emailMessage =
    order.status === "delivered"
      ? `Great news! Your order #${displayOrderId} has been delivered.`
      : `Thank you for your order! Your order #${displayOrderId} has been confirmed.`;

  const subtotal = order.items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const freeDeliveryThreshold = parseFloat(
    process.env.FREE_DELIVERY_THRESHOLD || "999",
  );
  const shipping = subtotal > freeDeliveryThreshold ? 0 : 15;
  const taxRate = parseFloat(process.env.TAX_RATE || "0");
  const tax = subtotal * taxRate;

  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid ${BRAND.border};">
        <div style="font-weight: 600; color: ${BRAND.dark}; margin-bottom: 4px;">${
          item.name
        }</div>
        <div style="font-size: 14px; color: ${BRAND.muted};">Quantity: ${
          item.quantity
        }</div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid ${BRAND.border}; text-align: right; font-weight: 600; color: ${BRAND.dark};">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${BRAND.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND.softBg}; line-height: 1.6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.softBg}; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(27, 31, 35, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: ${BRAND.lime}; padding: 40px 30px; text-align: center;">
              <div style="background-color: ${BRAND.dark}; display: inline-block; padding: 14px 28px; border-radius: 999px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: ${BRAND.lime}; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">${BRAND.name}</h1>
              </div>
              <h2 style="margin: 0; color: ${BRAND.dark}; font-size: 24px; font-weight: 700;">${emailTitle} ${order.status === "delivered" ? "🚚" : "🎉"}</h2>
              <p style="margin: 10px 0 0 0; color: ${BRAND.muted}; font-size: 16px;">${order.status === "delivered" ? "Your order has been delivered!" : "Thank you for your purchase"}</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <h3 style="margin: 0 0 15px 0; color: ${BRAND.dark}; font-size: 20px; font-weight: 600;">Hi ${userName}! 👋</h3>
              <p style="margin: 0; color: ${BRAND.muted}; font-size: 15px; line-height: 1.6;">
                ${emailMessage}
              </p>
            </td>
          </tr>

          <!-- Order Details Card -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.softBg}; border-radius: 8px; border: 1px solid ${BRAND.border}; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <div style="font-size: 13px; color: ${BRAND.muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Order Number</div>
                          <div style="font-size: 18px; font-weight: 700; color: ${BRAND.dark};">#${displayOrderId}</div>
                        </td>
                        <td align="right">
                          <div style="font-size: 13px; color: ${BRAND.muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Status</div>
                          <div style="display: inline-block; background-color: ${BRAND.lime}; color: ${BRAND.dark}; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 700;">
                            ${order.status.toUpperCase()}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h4 style="margin: 0 0 15px 0; color: ${BRAND.dark}; font-size: 16px; font-weight: 600;">Order Items</h4>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid ${BRAND.border}; border-radius: 8px; overflow: hidden;">
                ${itemsHTML}
                
                <tr>
                  <td style="padding: 15px; background-color: ${BRAND.softBg}; font-weight: 600; color: ${BRAND.muted};">Subtotal</td>
                  <td style="padding: 15px; background-color: ${BRAND.softBg}; text-align: right; font-weight: 600; color: ${BRAND.muted};">${formatCurrency(
                    subtotal,
                  )}</td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: ${BRAND.softBg}; font-weight: 600; color: ${BRAND.muted};">Shipping</td>
                  <td style="padding: 15px; background-color: ${BRAND.softBg}; text-align: right; font-weight: 600; color: ${BRAND.muted};">${formatCurrency(
                    shipping,
                  )}</td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: ${BRAND.softBg}; font-weight: 600; color: ${BRAND.muted};">Tax</td>
                  <td style="padding: 15px; background-color: ${BRAND.softBg}; text-align: right; font-weight: 600; color: ${BRAND.muted};">${formatCurrency(
                    tax,
                  )}</td>
                </tr>
                
                <tr style="background-color: ${BRAND.dark};">
                  <td style="padding: 20px; color: ${BRAND.lime}; font-weight: 700; font-size: 16px;">TOTAL</td>
                  <td style="padding: 20px; text-align: right; color: ${BRAND.lime}; font-weight: 700; font-size: 20px;">${formatCurrency(
                    order.total,
                  )}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          ${
            order.shippingAddress
              ? `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h4 style="margin: 0 0 15px 0; color: ${BRAND.dark}; font-size: 16px; font-weight: 600;">📦 Shipping Address</h4>
              <div style="background-color: ${BRAND.softBg}; border: 1px solid ${BRAND.border}; border-radius: 8px; padding: 20px;">
                <p style="margin: 0; color: ${BRAND.dark}; line-height: 1.6; font-size: 15px;">
                  ${order.shippingAddress.apartment ? order.shippingAddress.apartment + ", " : ""}${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                  ${order.shippingAddress.country}
                </p>
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <!-- What's Next -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: ${BRAND.lime}; border-radius: 8px; padding: 25px; border-left: 4px solid ${BRAND.dark};">
                ${
                  order.status === "delivered"
                    ? `
                <h4 style="margin: 0 0 15px 0; color: ${BRAND.dark}; font-size: 16px; font-weight: 700;">🎉 Order Delivered Successfully!</h4>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top; width: 30px;">
                      <div style="background-color: ${BRAND.dark}; color: ${BRAND.lime}; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">✓</div>
                    </td>
                    <td style="padding: 8px 0; color: ${BRAND.dark}; font-size: 14px;">
                      <strong>Delivered</strong> - Your order has been successfully delivered!
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <div style="background-color: ${BRAND.dark}; color: ${BRAND.lime}; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">★</div>
                    </td>
                    <td style="padding: 8px 0; color: ${BRAND.dark}; font-size: 14px;">
                      <strong>Leave a Review</strong> - Help other customers with your feedback
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <div style="background-color: ${BRAND.dark}; color: ${BRAND.lime}; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">+</div>
                    </td>
                    <td style="padding: 8px 0; color: ${BRAND.dark}; font-size: 14px;">
                      <strong>Shop Again</strong> - Discover more pieces for your home
                    </td>
                  </tr>
                </table>
                <p style="margin: 15px 0 0 0; color: ${BRAND.dark}; font-size: 13px; font-style: italic;">
                  We hope you love your purchase!
                </p>
                `
                    : `
                <h4 style="margin: 0 0 15px 0; color: ${BRAND.dark}; font-size: 16px; font-weight: 700;">📋 What Happens Next?</h4>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top; width: 30px;">
                      <div style="background-color: ${BRAND.dark}; color: ${BRAND.lime}; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">1</div>
                    </td>
                    <td style="padding: 8px 0; color: ${BRAND.dark}; font-size: 14px;">
                      <strong>Processing</strong> - We're preparing your order for shipment
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <div style="background-color: ${BRAND.dark}; color: ${BRAND.lime}; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">2</div>
                    </td>
                    <td style="padding: 8px 0; color: ${BRAND.dark}; font-size: 14px;">
                      <strong>Shipped</strong> - You'll receive tracking info via email
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <div style="background-color: ${BRAND.dark}; color: ${BRAND.lime}; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">3</div>
                    </td>
                    <td style="padding: 8px 0; color: ${BRAND.dark}; font-size: 14px;">
                      <strong>In Transit</strong> - Track your package in real-time
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <div style="background-color: ${BRAND.dark}; color: ${BRAND.lime}; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600;">4</div>
                    </td>
                    <td style="padding: 8px 0; color: ${BRAND.dark}; font-size: 14px;">
                      <strong>Delivered</strong> - Enjoy your purchase!
                    </td>
                  </tr>
                </table>
                <p style="margin: 15px 0 0 0; color: ${BRAND.dark}; font-size: 13px; font-style: italic;">
                  Estimated delivery: 3-5 business days
                </p>
                `
                }
              </div>
            </td>
          </tr>

          <!-- Help -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: ${BRAND.softBg}; border-radius: 8px; padding: 20px; text-align: center; border: 1px solid ${BRAND.border};">
                <p style="margin: 0 0 15px 0; color: ${BRAND.dark}; font-size: 15px; font-weight: 700;">Need Help? We're Here!</p>
                <p style="margin: 0; color: ${BRAND.muted}; font-size: 14px;">
                  📧 <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.dark}; text-decoration: none; font-weight: 600;">${BRAND.supportEmail}</a><br>
                  📞 +1 (555) 123-4567<br>
                  🕒 Mon-Fri: 9AM - 6PM EST
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND.dark}; padding: 30px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: ${BRAND.lime}; font-size: 16px; font-weight: 700;">Thank you for choosing ${BRAND.name}!</p>
              <p style="margin: 0 0 20px 0; color: #919EAB; font-size: 14px;">
                We appreciate your business and trust in our products.
              </p>
              <div style="margin: 0 0 15px 0;">
                <a href="#" style="display: inline-block; margin: 0 10px; color: ${BRAND.lime}; text-decoration: none; font-size: 14px;">Facebook</a>
                <span style="color: #495057;">|</span>
                <a href="#" style="display: inline-block; margin: 0 10px; color: ${BRAND.lime}; text-decoration: none; font-size: 14px;">Instagram</a>
                <span style="color: #495057;">|</span>
                <a href="#" style="display: inline-block; margin: 0 10px; color: ${BRAND.lime}; text-decoration: none; font-size: 14px;">Twitter</a>
              </div>
              <p style="margin: 0; color: #919EAB; font-size: 12px;">
                © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

const generateNewsletterEmailHTML = (
  subject: string,
  bodyHtml: string,
  buttonText?: string,
  buttonUrl?: string,
): string => {
  const hasButton = Boolean(buttonText?.trim() && buttonUrl?.trim());
  const safeButtonText = (buttonText || "").trim();
  const safeButtonUrl = (buttonUrl || "").trim();

  const buttonSection = hasButton
    ? `
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px;" align="center">
              <a href="${safeButtonUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: ${BRAND.dark}; color: ${BRAND.lime}; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 32px; border-radius: 999px; letter-spacing: 0.3px;">
                ${safeButtonText}
              </a>
            </td>
          </tr>
`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject} - ${BRAND.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND.softBg}; line-height: 1.6;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.softBg}; padding: 40px 20px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(27, 31, 35, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${BRAND.lime}; padding: 40px 30px; text-align: center;">
              <div style="background-color: ${BRAND.dark}; display: inline-block; padding: 14px 28px; border-radius: 999px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: ${BRAND.lime}; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">${BRAND.name}</h1>
              </div>
              <h2 style="margin: 0; color: ${BRAND.dark}; font-size: 24px; font-weight: 700;">Newsletter</h2>
              <p style="margin: 10px 0 0 0; color: ${BRAND.muted}; font-size: 16px;">News, updates & exclusive offers</p>
            </td>
          </tr>

          <!-- Subject badge -->
          <tr>
            <td style="padding: 30px 30px 10px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.softBg}; border-radius: 8px; border: 1px solid ${BRAND.border}; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 13px; color: ${BRAND.muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">This Issue</div>
                    <div style="font-size: 18px; font-weight: 700; color: ${BRAND.dark};">${subject}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 30px 30px 30px;">
              <div style="background-color: ${BRAND.softBg}; border: 1px solid ${BRAND.border}; border-radius: 8px; padding: 24px; color: ${BRAND.dark}; font-size: 15px; line-height: 1.7;">
                <div style="color: ${BRAND.muted}; font-size: 15px; line-height: 1.7;">
                  ${bodyHtml}
                </div>
              </div>
            </td>
          </tr>

          ${buttonSection}

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND.dark}; padding: 30px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: ${BRAND.lime}; font-size: 16px; font-weight: 700;">Thank you for being part of ${BRAND.name}!</p>
              <p style="margin: 0 0 20px 0; color: #919EAB; font-size: 14px;">
                You received this email because you subscribed to our newsletter.
              </p>
              <div style="margin: 0 0 15px 0;">
                <a href="#" style="display: inline-block; margin: 0 10px; color: ${BRAND.lime}; text-decoration: none; font-size: 14px;">Facebook</a>
                <span style="color: #495057;">|</span>
                <a href="#" style="display: inline-block; margin: 0 10px; color: ${BRAND.lime}; text-decoration: none; font-size: 14px;">Instagram</a>
                <span style="color: #495057;">|</span>
                <a href="#" style="display: inline-block; margin: 0 10px; color: ${BRAND.lime}; text-decoration: none; font-size: 14px;">Twitter</a>
              </div>
              <p style="margin: 0; color: #919EAB; font-size: 12px;">
                © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

const generateOrderEmailContent = (
  userName: string,
  order: IOrder,
): { subject: string; message: string } => {
  const isDelivered = order.status === "delivered";
  const emailTitle = isDelivered ? "Order Delivered" : "Order Confirmation";
  const displayOrderId = formatOrderDisplayId(order._id);
  const emailMessage = isDelivered
    ? `Great news! Your order #${displayOrderId} has been delivered! We hope you love your purchase.`
    : `Thank you for your order! Your order #${displayOrderId} has been confirmed and is now being prepared for shipment. We'll keep you updated every step of the way.`;

  const subtotal = order.items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const freeDeliveryThreshold = parseFloat(
    process.env.FREE_DELIVERY_THRESHOLD || "999",
  );
  const shipping = subtotal > freeDeliveryThreshold ? 0 : 15;
  const taxRate = parseFloat(process.env.TAX_RATE || "0");
  const tax = subtotal * taxRate;

  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.name} (Qty: ${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`,
    )
    .join("\n");

  return {
    subject: `${emailTitle} #${displayOrderId} - ${BRAND.name}`,
    message: `
Hi ${userName},

${emailMessage}

Order Details:
- Order Number: #${displayOrderId}
- Status: ${order.status}

Items Ordered:
${itemsList}

Order Summary:
- Subtotal: ${formatCurrency(subtotal)}
- Shipping: ${shipping === 0 ? "Free" : formatCurrency(shipping)}
- Tax: ${formatCurrency(tax)}
- Total: ${formatCurrency(order.total)}

${
  order.shippingAddress
    ? `
Shipping Address:
${order.shippingAddress.apartment ? order.shippingAddress.apartment + ", " : ""}${order.shippingAddress.firstName} ${order.shippingAddress.lastName}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}
`
    : ""
}

${
  order.status === "delivered"
    ? `Your order has been successfully delivered! We hope you love your purchase.

What's Next?
- Leave a review to help other customers
- Contact us if anything doesn't meet your expectations
- Check out our latest products for your next order`
    : `What Happens Next?
1. Processing - We're preparing your order for shipment
2. Shipped - You'll receive tracking info via email
3. In Transit - Track your package in real-time
4. Delivered - Enjoy your purchase!

Estimated delivery: 3-5 business days`
}

Need Help?
Email: ${BRAND.supportEmail}
Phone: +1 (555) 123-4567
Hours: Mon-Fri: 9AM - 6PM EST

Thanks for choosing ${BRAND.name}!
    `,
  };
};

const sendOrderConfirmationEmail = async ({
  userEmail,
  userName,
  order,
}: {
  userEmail: string;
  userName: string;
  order: IOrder;
}) => {
  try {
    const emailContent = generateOrderEmailContent(userName, order);
    const htmlContent = generateOrderEmailHTML(userName, order);

    const transporter: Transporter = createTransporter();

    const mailOptions = {
      from: brandFrom(),
      to: userEmail,
      subject: emailContent.subject,
      text: emailContent.message,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("❌ Failed to send order confirmation:", error.message);
    return {
      success: false,
      error: error.message,
      message: "Email service unavailable - order created successfully",
    };
  }
};

const sendInvoiceEmail = async ({
  to,
  subject,
  message,
  invoiceHtml,
  invoiceNumber,
}: {
  to: string;
  subject: string;
  message: string;
  invoiceHtml: string;
  invoiceNumber: string;
}) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: brandFrom(),
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${BRAND.lime}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: ${BRAND.dark}; margin: 0;">${BRAND.name} - Invoice</h2>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid ${BRAND.border}; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: ${BRAND.dark}; line-height: 1.6; margin-bottom: 16px;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid ${BRAND.border}; border-radius: 8px;">
            ${invoiceHtml}
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: ${BRAND.dark}; border-radius: 8px;">
            <p style="color: ${BRAND.lime}; font-size: 14px; margin: 0;">
              Thank you for choosing ${BRAND.name}!<br>
              If you have any questions, please contact us at ${BRAND.supportEmail}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

const sendEmail = async ({
  to,
  subject,
  message,
  html,
}: {
  to: string;
  subject: string;
  message: string;
  html?: string;
}) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: brandFrom(),
      to,
      subject,
      text: message,
      html:
        html ||
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${BRAND.lime}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: ${BRAND.dark}; margin: 0;">${BRAND.name}</h2>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid ${BRAND.border}; border-radius: 8px;">
            <p style="color: ${BRAND.dark}; line-height: 1.6;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: ${BRAND.dark}; border-radius: 8px;">
            <p style="color: ${BRAND.lime}; font-size: 14px; margin: 0;">
              Thank you for choosing ${BRAND.name}!<br>
              If you have any questions, please contact us at ${BRAND.supportEmail}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

const sendPasswordResetEmail = async (
  email: string,
  userName: string,
  resetUrl: string,
) => {
  const transporter = createTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - ${BRAND.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND.softBg}; line-height: 1.6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.softBg}; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(27, 31, 35, 0.08);">
          
          <tr>
            <td style="background-color: ${BRAND.lime}; padding: 40px 30px; text-align: center;">
              <div style="background-color: ${BRAND.dark}; display: inline-block; padding: 14px 28px; border-radius: 999px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: ${BRAND.lime}; font-size: 26px; font-weight: 700;">${BRAND.name}</h1>
              </div>
              <h2 style="margin: 0; color: ${BRAND.dark}; font-size: 24px; font-weight: 700;">🔐 Reset Your Password</h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <h3 style="margin: 0 0 15px 0; color: ${BRAND.dark}; font-size: 20px; font-weight: 600;">Hi ${userName}! 👋</h3>
              <p style="margin: 0 0 20px 0; color: ${BRAND.muted}; font-size: 15px; line-height: 1.6;">
                We received a request to reset your password for your ${BRAND.name} account. If you didn't make this request, you can safely ignore this email.
              </p>
              
              <p style="margin: 0 0 30px 0; color: ${BRAND.muted}; font-size: 15px; line-height: 1.6;">
                To reset your password, click the button below:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; background-color: ${BRAND.dark}; color: ${BRAND.lime}; text-decoration: none; padding: 16px 40px; border-radius: 999px; font-weight: 700; font-size: 16px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: ${BRAND.lime}; border-left: 4px solid ${BRAND.dark}; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; color: ${BRAND.dark}; font-size: 14px; line-height: 1.5;">
                  <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                </p>
              </div>

              <p style="margin: 0 0 15px 0; color: ${BRAND.muted}; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px 0; word-break: break-all;">
                <a href="${resetUrl}" style="color: ${BRAND.dark}; text-decoration: none; font-size: 14px; font-weight: 600;">${resetUrl}</a>
              </p>

              <p style="margin: 0; color: ${BRAND.muted}; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: ${BRAND.dark}; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: ${BRAND.lime}; font-size: 13px;">
                Best regards,<br>
                <strong>The ${BRAND.name} Team</strong>
              </p>
              <p style="margin: 0; color: #919EAB; font-size: 12px;">
                © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;

  const mailOptions = {
    from: brandFrom(),
    to: email,
    subject: `Reset Your Password - ${BRAND.name}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

const sendPasswordResetOtpEmail = async (
  email: string,
  userName: string,
  otpCode: string,
) => {
  const transporter = createTransporter();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - ${BRAND.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND.softBg}; line-height: 1.6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.softBg}; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(27, 31, 35, 0.08);">
          
          <tr>
            <td style="background-color: ${BRAND.lime}; padding: 40px 30px; text-align: center;">
              <div style="background-color: ${BRAND.dark}; display: inline-block; padding: 14px 28px; border-radius: 999px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: ${BRAND.lime}; font-size: 26px; font-weight: 700;">${BRAND.name}</h1>
              </div>
              <h2 style="margin: 0; color: ${BRAND.dark}; font-size: 24px; font-weight: 700;">🔐 Password Reset Code</h2>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 30px;">
              <h3 style="margin: 0 0 15px 0; color: ${BRAND.dark}; font-size: 20px; font-weight: 600;">Hi ${userName}! 👋</h3>
              <p style="margin: 0 0 20px 0; color: ${BRAND.muted}; font-size: 15px; line-height: 1.6;">
                We received a request to reset your password for your ${BRAND.name} account. If you didn't make this request, you can safely ignore this email.
              </p>
              
              <p style="margin: 0 0 20px 0; color: ${BRAND.muted}; font-size: 15px; line-height: 1.6;">
                Enter the following 6-digit code to continue resetting your password:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <div style="background-color: ${BRAND.lime}; border: 2px solid ${BRAND.dark}; padding: 20px 40px; border-radius: 12px; display: inline-block;">
                      <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: ${BRAND.dark};">${otpCode}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="background-color: ${BRAND.softBg}; border-left: 4px solid ${BRAND.dark}; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; color: ${BRAND.dark}; font-size: 14px; line-height: 1.5;">
                  <strong>Important:</strong> This code will expire in 15 minutes for security reasons.
                </p>
              </div>

              <p style="margin: 0; color: ${BRAND.muted}; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color: ${BRAND.dark}; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: ${BRAND.lime}; font-size: 13px;">
                Best regards,<br>
                <strong>The ${BRAND.name} Team</strong>
              </p>
              <p style="margin: 0; color: #919EAB; font-size: 12px;">
                © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;

  const mailOptions = {
    from: brandFrom(),
    to: email,
    subject: `Your Password Reset Code - ${BRAND.name}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset OTP email sent:", info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("Error sending password reset OTP email:", error);
    throw new Error("Failed to send password reset OTP email");
  }
};

const escapeHtml = (value: string): string =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export type ContactEmailPayload = {
  firstName: string;
  lastName?: string;
  phone?: string;
  email: string;
  subject: string;
  message: string;
};

const getAdminInbox = () =>
  process.env.SUPPORT_EMAIL ||
  process.env.SENDER_EMAIL_ADDRESS ||
  BRAND.supportEmail;

const buildContactEmailShell = ({
  title,
  subtitle,
  greeting,
  bodyHtml,
}: {
  title: string;
  subtitle: string;
  greeting: string;
  bodyHtml: string;
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${BRAND.name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND.softBg}; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.softBg}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(27, 31, 35, 0.08);">
          <tr>
            <td style="background-color: ${BRAND.lime}; padding: 40px 30px; text-align: center;">
              <div style="background-color: ${BRAND.dark}; display: inline-block; padding: 14px 28px; border-radius: 999px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: ${BRAND.lime}; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">${BRAND.name}</h1>
              </div>
              <h2 style="margin: 0; color: ${BRAND.dark}; font-size: 24px; font-weight: 700;">${title}</h2>
              <p style="margin: 10px 0 0 0; color: ${BRAND.muted}; font-size: 16px;">${subtitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 30px 10px 30px;">
              <h3 style="margin: 0 0 12px 0; color: ${BRAND.dark}; font-size: 20px; font-weight: 600;">${greeting}</h3>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color: ${BRAND.dark}; padding: 30px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: ${BRAND.lime}; font-size: 13px;">
                Best regards,<br>
                <strong>The ${BRAND.name} Team</strong>
              </p>
              <p style="margin: 0; color: #919EAB; font-size: 12px;">
                © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const generateContactUserEmailHTML = (payload: ContactEmailPayload): string => {
  const name = escapeHtml(
    [payload.firstName, payload.lastName].filter(Boolean).join(" ").trim() ||
      "there",
  );
  const subject = escapeHtml(payload.subject);
  const message = escapeHtml(payload.message).replace(/\n/g, "<br>");

  return buildContactEmailShell({
    title: "We received your message ✉️",
    subtitle: "Thanks for contacting us",
    greeting: `Hi ${name}! 👋`,
    bodyHtml: `
      <p style="margin: 0 0 20px 0; color: ${BRAND.muted}; font-size: 15px; line-height: 1.6;">
        Thank you for reaching out to ${BRAND.name}. We've received your message and our team will get back to you as soon as possible.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.softBg}; border-radius: 8px; border: 1px solid ${BRAND.border}; overflow: hidden; margin-bottom: 20px;">
        <tr>
          <td style="padding: 20px;">
            <div style="font-size: 13px; color: ${BRAND.muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Subject</div>
            <div style="font-size: 18px; font-weight: 700; color: ${BRAND.dark};">${subject}</div>
          </td>
        </tr>
      </table>
      <div style="background-color: ${BRAND.softBg}; border: 1px solid ${BRAND.border}; border-radius: 8px; padding: 20px;">
        <div style="font-size: 13px; color: ${BRAND.muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Your Message</div>
        <p style="margin: 0; color: ${BRAND.dark}; font-size: 15px; line-height: 1.7;">${message}</p>
      </div>
      <p style="margin: 20px 0 0 0; color: ${BRAND.muted}; font-size: 14px; line-height: 1.6;">
        If you need urgent help, reply to this email or contact us at
        <a href="mailto:${getAdminInbox()}" style="color: ${BRAND.dark}; font-weight: 600; text-decoration: none;">${getAdminInbox()}</a>.
      </p>
    `,
  });
};

const generateContactAdminEmailHTML = (
  payload: ContactEmailPayload,
): string => {
  const fullName = escapeHtml(
    [payload.firstName, payload.lastName].filter(Boolean).join(" ").trim(),
  );
  const email = escapeHtml(payload.email);
  const phone = escapeHtml(payload.phone || "—");
  const subject = escapeHtml(payload.subject);
  const message = escapeHtml(payload.message).replace(/\n/g, "<br>");

  const detailRow = (label: string, value: string) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND.border}; width: 140px; color: ${BRAND.muted}; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; vertical-align: top;">${label}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${BRAND.border}; color: ${BRAND.dark}; font-size: 15px; font-weight: 600;">${value}</td>
    </tr>
  `;

  return buildContactEmailShell({
    title: "New Contact Message 📩",
    subtitle: "A customer submitted the contact form",
    greeting: "Hello Admin,",
    bodyHtml: `
      <p style="margin: 0 0 20px 0; color: ${BRAND.muted}; font-size: 15px; line-height: 1.6;">
        You have a new message from the website contact form. Details are below.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.softBg}; border-radius: 8px; border: 1px solid ${BRAND.border}; overflow: hidden; margin-bottom: 20px;">
        ${detailRow("Name", fullName)}
        ${detailRow("Email", `<a href="mailto:${email}" style="color: ${BRAND.dark}; text-decoration: none;">${email}</a>`)}
        ${detailRow("Phone", phone)}
        ${detailRow("Subject", subject)}
      </table>
      <div style="background-color: ${BRAND.softBg}; border: 1px solid ${BRAND.border}; border-radius: 8px; padding: 20px;">
        <div style="font-size: 13px; color: ${BRAND.muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Message</div>
        <p style="margin: 0; color: ${BRAND.dark}; font-size: 15px; line-height: 1.7;">${message}</p>
      </div>
    `,
  });
};

/**
 * Sends branded contact emails to the customer (confirmation) and admin (notification).
 */
const sendContactEmails = async (payload: ContactEmailPayload) => {
  const transporter = createTransporter();
  const adminTo = getAdminInbox();
  const customerName =
    [payload.firstName, payload.lastName].filter(Boolean).join(" ").trim() ||
    "Customer";

  const userHtml = generateContactUserEmailHTML(payload);
  const adminHtml = generateContactAdminEmailHTML(payload);

  const userText = `Hi ${customerName},\n\nThank you for contacting ${BRAND.name}. We received your message about "${payload.subject}" and will get back to you soon.\n\nYour message:\n${payload.message}\n\n— The ${BRAND.name} Team`;
  const adminText = `New contact form submission\n\nName: ${customerName}\nEmail: ${payload.email}\nPhone: ${payload.phone || "—"}\nSubject: ${payload.subject}\n\nMessage:\n${payload.message}`;

  const [userResult, adminResult] = await Promise.allSettled([
    transporter.sendMail({
      from: brandFrom(),
      to: payload.email,
      subject: `We received your message - ${BRAND.name}`,
      text: userText,
      html: userHtml,
      replyTo: adminTo,
    }),
    transporter.sendMail({
      from: brandFrom(),
      to: adminTo,
      subject: `New contact: ${payload.subject} - ${BRAND.name}`,
      text: adminText,
      html: adminHtml,
      replyTo: payload.email,
    }),
  ]);

  if (userResult.status === "rejected") {
    console.error("Contact user email failed:", userResult.reason);
  } else {
    console.log("Contact user email sent:", userResult.value.messageId);
  }

  if (adminResult.status === "rejected") {
    console.error("Contact admin email failed:", adminResult.reason);
  } else {
    console.log("Contact admin email sent:", adminResult.value.messageId);
  }

  return {
    userSent: userResult.status === "fulfilled",
    adminSent: adminResult.status === "fulfilled",
  };
};

export {
  sendInvoiceEmail,
  sendEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendPasswordResetOtpEmail,
  sendContactEmails,
  generateNewsletterEmailHTML,
};
