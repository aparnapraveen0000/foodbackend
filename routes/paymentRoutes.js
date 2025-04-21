const express = require("express");
const router = express.Router();

// Middleware
const { authUser } = require("../middlewares/authUser.js");

// Controller
const {createStripeSession} = require("../controllers/paymentController.js");

// @route   POST /api/payment/create-checkout-session
// @desc    Create Stripe Checkout session
// @access  Private
router.post("/create-checkout-session", authUser, createStripeSession);


module.exports = router
