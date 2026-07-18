import Stripe from "stripe";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Order from "../models/orderModel.js";
import { IUser } from "../types/index.js";
import { getStoreSettings } from "../utils/storeSettings.js";

interface AuthRequest extends Request {
  user?: IUser;
}

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-02-25.clover",
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createCheckoutSession = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const storeSettings = await getStoreSettings();
      if (!storeSettings.enableStripe) {
        res.status(400).json({
          success: false,
          message: "Card payments are currently disabled",
        });
        return;
      }

      if (!req.body) {
        res
          .status(400)
          .json({ success: false, message: "Request body is missing" });
        return;
      }

      const { orderId, currency = "usd" } = req.body;

      if (!orderId) {
        res
          .status(400)
          .json({ success: false, message: "Order ID is required" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authorized" });
        return;
      }

      const order = await Order.findById(orderId).populate("items.productId");
      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }

      if (!order.userId.equals(req.user._id)) {
        res.status(403).json({
          success: false,
          message: "Not authorized to pay for this order",
        });
        return;
      }

      if (order.isPaid || order.paymentStatus === "paid") {
        res.status(400).json({
          success: false,
          message: "This order has already been paid",
        });
        return;
      }

      const amountInCents = Math.round(order.total * 100);
      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: req.user.email,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Order #${order._id.toString().slice(-8).toUpperCase()}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${clientUrl}/en/success/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/en/user/orders/${order._id}`,
        client_reference_id: order._id.toString(),
        metadata: {
          orderId: order._id.toString(),
          userId: req.user._id.toString(),
        },
      });

      res.status(200).json({
        success: true,
        url: session.url,
        sessionId: session.id,
        message: "Checkout session created successfully",
      });
    } catch (error: unknown) {
      console.error("❌ Create checkout session error:", error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      });
    }
  },
);

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const storeSettings = await getStoreSettings();
      if (!storeSettings.enableStripe) {
        res.status(400).json({
          success: false,
          message: "Card payments are currently disabled",
        });
        return;
      }

      if (!req.body) {
        res.status(400).json({
          success: false,
          message: "Request body is missing",
        });
        return;
      }

      const { orderId, currency = "usd" } = req.body;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authorized",
        });
        return;
      }

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      if (!order.userId.equals(req.user._id)) {
        res.status(403).json({
          success: false,
          message: "Not authorized to pay for this order",
        });
        return;
      }

      if (order.isPaid || order.paymentStatus === "paid") {
        res.status(400).json({
          success: false,
          message: "This order has already been paid",
        });
        return;
      }

      const amountInCents = Math.round(order.total * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: {
          orderId: orderId.toString(), // Ensure string
          userId: req.user._id.toString(), // Convert ObjectId to string
          userEmail: req.user.email,
        },
        payment_method_types: ["card"],
        description: `Payment for Baby Shop Order #${orderId
          .slice(-8)
          .toUpperCase()}`,
      });

      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        message: "Payment intent created successfully",
      });
    } catch (error: unknown) {
      console.error("❌ Create payment intent error:", error);
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create payment intent",
      });
    }
  },
);

// @desc    Handle Stripe webhook (for production use)
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
export const handleStripeWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error("❌ STRIPE_WEBHOOK_SECRET not configured");
      res.status(400).send("Webhook secret not configured");
      return;
    }

    if (!sig) {
      res.status(400).send("Stripe signature missing");
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("❌ Webhook signature verification failed:", errorMessage);
      res.status(400).send(`Webhook Error: ${errorMessage}`);
      return;
    }

    // Handle the verified event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update order status in database
        const orderIdFromSession =
          session.metadata?.orderId || session.client_reference_id;
        if (orderIdFromSession) {
          try {
            const updatedOrder = await Order.findByIdAndUpdate(
              orderIdFromSession,
              {
                paymentStatus: "paid",
                isPaid: true,
                paidAt: new Date(),
                paymentMethod: "stripe",
                stripeSessionId: session.id,
                paymentIntentId: session.payment_intent,
                payment_info: {
                  gateway: "stripe",
                  stripe: {
                    paymentIntentId:
                      typeof session.payment_intent === "string"
                        ? session.payment_intent
                        : undefined,
                    sessionId: session.id,
                  },
                  paidAmount: session.amount_total
                    ? session.amount_total / 100
                    : 0,
                  currency: session.currency?.toUpperCase(),
                  paidAt: new Date(),
                },
              },
              { new: true },
            );
            if (updatedOrder) {
              console.log(
                `✅ Order ${orderIdFromSession} marked as paid from checkout.session.completed`,
              );
            }
          } catch (error) {
            console.error(
              "❌ Failed to update order via checkout.session.completed webhook:",
              error,
            );
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update order status in database
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          try {
            // Get payment method details from Stripe
            let cardBrand = null;
            let cardLast4 = null;
            let paymentMethodType = null;
            const piAny = paymentIntent as unknown as {
              charges?: {
                data: Array<{
                  id: string;
                  receipt_url?: string;
                  payment_method_details?: {
                    type: string;
                    card?: { brand: string; last4: string };
                  };
                }>;
              };
            };

            if (piAny.charges && piAny.charges.data && piAny.charges.data[0]) {
              const charge = piAny.charges.data[0];
              if (charge.payment_method_details) {
                paymentMethodType = charge.payment_method_details.type;
                if (charge.payment_method_details.card) {
                  cardBrand = charge.payment_method_details.card.brand;
                  cardLast4 = charge.payment_method_details.card.last4;
                }
              }
            }

            const updatedOrder = await Order.findByIdAndUpdate(
              orderId,
              {
                paymentStatus: "paid",
                isPaid: true,
                paidAt: new Date(),
                paymentMethod: "stripe",
                paymentIntentId: paymentIntent.id,
                payment_info: {
                  gateway: "stripe",
                  stripe: {
                    paymentIntentId: paymentIntent.id,
                    paymentMethodType: paymentMethodType,
                    cardBrand: cardBrand,
                    cardLast4: cardLast4,
                    receiptUrl: piAny.charges?.data[0]?.receipt_url,
                    chargeId: piAny.charges?.data[0]?.id,
                  },
                  paidAmount: paymentIntent.amount / 100,
                  currency: paymentIntent.currency.toUpperCase(),
                  paidAt: new Date(),
                },
              },
              { new: true },
            );

            if (updatedOrder) {
              console.log(
                `✅ Order ${orderId} marked as paid from payment_intent.succeeded`,
              );
            }
          } catch (error: unknown) {
            console.error("❌ Failed to update order via webhook:", error);
          }
        }
        break;
      }

      case "payment_intent.payment_failed":
      case "payment_intent.created":
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Send success response
    res.json({ received: true });
  },
);
