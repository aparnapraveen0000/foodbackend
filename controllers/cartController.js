const cartModel = require("../model/cartModel");
const menuModel = require("../model/menuModel");

// Add item to cart
const addToCart = async (req, res) => {
  const { foodId, quantity } = req.body;

  try {
    if (!foodId || typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ message: "Invalid foodId or quantity" });
    }

    let cart = await cartModel.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new cartModel({
        userId: req.user.id,
        items: [],
        totalPrice: 0,
      });
    }

    const existingItem = cart.items.find(
      (item) => item.foodId.toString() === foodId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const menuItem = await menuModel.findById(foodId);
      if (!menuItem) {
        return res.status(404).json({ message: "Food item not found" });
      }

      cart.items.push({
        foodId,
        quantity,
        price: menuItem.price,
      });
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    return res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get user's cart with populated item name
const getCart = async (req, res) => {
  try {
    const cart = await cartModel
      .findOne({ userId: req.user.id })
      .populate({
        path: "items.foodId",
        select: "itemName description price category foodImage", // add other fields if needed
      });

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    return res.status(200).json({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  const { foodId } = req.body;

  try {
    if (!foodId) {
      return res.status(400).json({ message: "foodId is required" });
    }

    const cart = await cartModel.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemExists = cart.items.some(
      (item) => item.foodId.toString() === foodId
    );

    if (!itemExists) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items = cart.items.filter(
      (item) => item.foodId.toString() !== foodId
    );

    // Recalculate total
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    return res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete entire cart
const deleteCart = async (req, res) => {
  try {
    const cart = await cartModel.findOneAndDelete({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json({ message: "Cart deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart:", error);
    return res.status(500).json({ message: "Server error" });
  }
};





const getUserCart = async (req, res) => {
    try {
        const userId = req.user.id; // From authUser middleware
        const cart = await cartModel
            .findOne({ userId })
            .populate({
                path: 'items.foodId',
                select: 'itemName price foodImage category restaurant itemAvailability',
                match: { itemAvailability: true } // Only include available items
            });
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Filter out items with null foodId (in case population failed)
        cart.items = cart.items.filter(item => item.foodId);
        
        res.status(200).json({ data: cart, message: 'Cart retrieved successfully' });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};



module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  deleteCart,
  getUserCart
};
