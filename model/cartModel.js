const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // should match your model name exactly
      required: true,
      unique: true, // one cart per user
    },
    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "menu", // assuming your menu model is named "menu"
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
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const cartModel = mongoose.model("cart", cartSchema);
module.exports = cartModel;
