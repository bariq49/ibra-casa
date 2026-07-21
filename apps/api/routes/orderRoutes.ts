import express from "express";
import {
  getOrders,
  getOrderById,
  createOrderFromCart,
  createCODOrder,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrder,
  deleteOrder,
  getAllOrdersAdmin,
  searchProductsForOrders,
  getPendingQCOrders,
  confirmOrderQC,
} from "../controllers/orderController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/orders/admin:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.route("/admin").get(protect, getAllOrdersAdmin);

/**
 * @swagger
 * /api/orders/qc/pending:
 *   get:
 *     summary: Get all pending QC orders (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending QC orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.route("/qc/pending").get(protect, getPendingQCOrders);

/**
 * @swagger
 * /api/orders/search-products:
 *   get:
 *     summary: Search products for adding to orders (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for products
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Products found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       image:
 *                         type: string
 *                       category:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.route("/search-products").get(protect, searchProductsForOrders);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [PayPal, Stripe, CashOnDelivery]
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cart is empty or validation error
 *       401:
 *         description: Unauthorized
 */
router.route("/").get(protect, getOrders).post(optionalAuth, createOrderFromCart);

/**
 * @swagger
 * /api/orders/cod:
 *   post:
 *     summary: Create COD (Cash on Delivery) order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *                     image:
 *                       type: string
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *     responses:
 *       201:
 *         description: COD order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.route("/cod").post(optionalAuth, createCODOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router
  .route("/:id")
  .get(optionalAuth, getOrderById)
  .put(protect, updateOrder)
  .delete(protect, deleteOrder);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.route("/:id/status").put(protect, updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/webhook-status:
 *   put:
 *     summary: Update order payment status via webhook
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [paid, pending, failed, refunded]
 *               paymentIntentId:
 *                 type: string
 *               stripeSessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order payment status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 */
router.route("/:id/webhook-status").put(updateOrderPaymentStatus);

/**
 * @swagger
 * /api/orders/{id}/qc:
 *   put:
 *     summary: Confirm QC and restock order items (Admin)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order QC confirmed and items restocked
 *       400:
 *         description: Order is not pending quality control
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
router.route("/:id/qc").put(protect, confirmOrderQC);

export default router;
