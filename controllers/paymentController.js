const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const cartModel = require("../model/cartModel");
const Payment = require("../model/paymentModel");

const createStripeSession = async (req, res) => {
  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY || !process.env.CLIENT_URL) {
      return res.status(500).json({ message: "Server configuration error. Missing environment variables." });
    }

    const { cartItems, totalPrice } = req.body;

    // Validate request body
    if (!cartItems || cartItems.length === 0 || !totalPrice) {
      return res.status(400).json({ message: "Cart items or total price is missing." });
    }

    // Validate user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    // Prepare line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: "usd", // Change to "inr" if needed
          product_data: {
            name: "YUMMYFOODS Order",
          },
          unit_amount: Math.round(totalPrice * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId: req.user.id,
      },
    });

    // Save payment record in the database
    const payment = new Payment({
      userId: req.user.id,
      items: cartItems.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: totalPrice,
      paymentIntentId: session.id,
      paymentStatus: "pending",
    });

    await payment.save();

    // Return session ID to the client
    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe session error:", error);
    return res.status(500).json({ message: "Failed to create Stripe session. Please try again later." });
  }
};

module.exports = { createStripeSession };




