const express = require('express');
const router = express.Router();
const { authSeller } = require("../middlewares/authSeller.js");
const { authUser } = require("../middlewares/authUser.js");
const { authAdmin } = require("../middlewares/authAdmin.js");
const { deleteOrder, updateOrder, createOrder, getSingleOrder, GetAdminOrders, getUserOrders } = require("../controllers/orderController.js");

// Create new order
router.post("/create", authUser, createOrder);

// Get all orders for a specific user
router.get("/user/items", authUser, getUserOrders);

// For admins to fetch all orders
router.get("/admin/get", authAdmin, GetAdminOrders);

// Get a single order by ID
router.get("/single/:orderId", authUser, getSingleOrder);

// Update order by ID
router.put("/update/:orderId", authSeller, authAdmin, updateOrder);

// Delete order by ID
router.delete("/delete/:orderId", authSeller, authAdmin, deleteOrder);

module.exports = router;