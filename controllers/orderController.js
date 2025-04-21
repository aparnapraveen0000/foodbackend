const orderModel = require('../model/orderModel.js');
const cartModel = require('../model/cartModel.js');
const menuModel = require('../model/menuModel.js');
const restaurantModel = require('../model/restaurantModel.js');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new order from cart
const createOrder = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { discount = 0 } = req.body;

        const cart = await cartModel
            .findOne({ userId })
            .populate({
                path: 'items.foodId',
                select: 'itemName price restaurant',
            });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty or not found' });
        }

        if (typeof discount !== 'number' || discount < 0) {
            return res.status(400).json({ message: 'Invalid discount value' });
        }

        let restaurantName = null;
        const orderItems = [];
        let totalQuantity = 0;

        for (const item of cart.items) {
            if (!item.foodId || !item.foodId._id || !item.quantity || !item.price) {
                return res.status(400).json({ message: 'Invalid cart item data' });
            }

            if (!restaurantName) {
                const restaurant = await restaurantModel.findById(item.foodId.restaurant);
                if (!restaurant) {
                    return res.status(404).json({ message: 'Restaurant not found' });
                }
                restaurantName = restaurant.name;
            }

            orderItems.push({
                itemNameId: item.foodId._id,
                quantity: item.quantity,
                price: item.price,
            });

            totalQuantity += item.quantity;
        }

        const totalPrice = cart.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0) - discount;

        if (totalPrice < 0) {
            return res.status(400).json({ message: 'Invalid discount value. Total price cannot be negative' });
        }

        const newOrder = new orderModel({
            userId,
            orderItems,
            restaurantName,
            discount,
            totalPrice,
            totalQuantity,
            paymentStatus: 'completed',
            orderStatus: 'confirmed',
        });

        await newOrder.save();

        await cartModel.findOneAndDelete({ userId });

        res.status(201).json({ message: 'Order created successfully', data: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
    }
};

// Get a single order by ID (updated with userId check)
const getSingleOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel
            .findById(orderId)
            .populate('userId', 'username email')
            .populate('orderItems.itemNameId', 'itemName price foodImage category');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure the user can only access their own order
        if (order.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to access this order' });
        }

        res.status(200).json({ data: order, message: 'Order found successfully' });
    } catch (error) {
        console.error('Error fetching single order:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
    }
};


const createStripeSession = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (!order.orderItems || order.orderItems.length === 0) {
            return res.status(400).json({ message: 'Order items are missing or invalid' });
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: order.orderItems.map(item => ({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.itemNameId?.name || 'Unnamed Item',
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                orderId: order._id,
            },
        });
        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({ message: 'Error creating Stripe session', error });
    }
};

const GetAdminOrders = async (req, res) => {
    try {
        const orders = await orderModel.find();
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { userId, orderItems, discount, paymentStatus, orderStatus } = req.body;
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { userId, orderItems, discount, paymentStatus, orderStatus },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order updated successfully', data: updatedOrder });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
    }
};

const deleteOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const deletedOrder = await orderModel.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ data: deletedOrder, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await orderModel
            .find({ userId })
            .populate({
                path: 'orderItems.itemNameId',
                select: 'itemName price foodImage category',
            })
            .sort({ createdAt: -1 });
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

module.exports = {
    getUserOrders,
    deleteOrder,
    updateOrder,
    createOrder,
    getSingleOrder,
    GetAdminOrders,
    createStripeSession,
};