const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minOrderAmount: {
      type: Number,
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    couponIsActive: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const couponModel = mongoose.model('coupon', couponSchema);
module.exports = couponModel;
