const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Update if your user model name is different
    required: true,
  },
  items: [
    {
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu", // Update if your menu model name is different
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentIntentId: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "succeeded", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
