const orderModel = require('../model/orderModel.js');
const cartModel = require('../model/cartModel.js');
const menuModel = require('../model/menuModel.js');
const restaurantModel = require('../model/restaurantModel.js');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new order from cart

const createOrder = async (req, res, next) => {
    try {
        const { restaurantId, orderItems } = req.body;
        const userId = req.user.id;

        // Validate menu items and restaurant consistency
        let restaurantIdFromItems = null;
        for (const item of orderItems) {
            const menuItem = await menuModel.findById(item.itemNameId);
            if (!menuItem) {
                return res.status(400).json({ message: `Menu item ${item.itemNameId} not found` });
            }
            if (!menuItem.itemAvailability) {
                return res.status(400).json({ message: `Menu item ${menuItem.itemName} is unavailable` });
            }
            if (!restaurantIdFromItems) {
                restaurantIdFromItems = menuItem.restaurant;
            } else if (restaurantIdFromItems.toString() !== menuItem.restaurant.toString()) {
                return res.status(400).json({ message: 'All items must be from the same restaurant' });
            }
        }

        // Validate restaurant
        if (!restaurantId || restaurantId !== restaurantIdFromItems.toString()) {
            return res.status(400).json({ message: 'Invalid or mismatched restaurant ID' });
        }
        const restaurant = await restaurantModel.findById(restaurantId);
        if (!restaurant) {
            return res.status(400).json({ message: 'Restaurant not found' });
        }

        // Calculate totals
        const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

        // Create order
        const order = await orderModel.create({
            userId,
            restaurantName: restaurant.name, // Use actual restaurant name
            totalPrice,
            totalQuantity,
            orderStatus: 'Pending',
            paymentStatus: 'confirmed',
            orderItems,
        });

        // Clear cart
        await cartModel.updateOne({ userId }, { items: [], totalPrice: 0 });

        res.status(201).json({ data: order, message: 'Order created successfully' });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
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



// Get user's orders
const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.user.id; // Assuming user ID from auth middleware
        const orders = await orderModel
            .find({ userId })
            .populate('orderItems.itemNameId') // Populate menu item details
            .lean(); // Convert to plain JS object for manipulation

        // Filter out invalid orderItems (where itemNameId is null)
        const cleanedOrders = orders.map(order => ({
            ...order,
            orderItems: order.orderItems.filter(item => item.itemNameId), // Remove items with null itemNameId
        }));

        res.status(200).json(cleanedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server error' });
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