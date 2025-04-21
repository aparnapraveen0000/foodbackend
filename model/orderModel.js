const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderItemSchema = new Schema({
    itemNameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'menu',
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
        min: 0,
    },
});

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        orderItems: [orderItemSchema],
        restaurantName: {
            type: String,
            required: true,
        },
        totalQuantity: {
            type: Number,
            required: true,
            min: 1,
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'confirmed',
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            required: true,
        },
    },
    { timestamps: true }
);

const orderModel = mongoose.model('order', orderSchema);

module.exports = orderModel;