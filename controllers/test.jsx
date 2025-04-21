// // const cartModel = require("../model/cartModel.js");
// // const menuModel = require("../model/menuModel.js");
// // const { authUser } = require("../middlewares/authUser.js");


// // // Add item to cart
// // const addToCart = async (req, res) => {
// //   const { foodId, quantity } = req.body;

// //   try {
// //     if (!foodId || !quantity || quantity < 1) {
// //       return res.status(400).json({ message: "Invalid foodId or quantity" });
// //     }

// //     let cart = await cartModel.findOne({ userId: req.user.id }); 
// //     if (!cart) {
// //       cart = new cartModel({ userId: req.user.id, items: [], totalPrice: 0 }); 
// //     }

// //     const existingItem = cart.items.find(
// //       (item) => item.foodId.toString() === foodId
// //     );

// //     if (existingItem) {
// //       existingItem.quantity += quantity;
// //     } else {
// //       const menuItem = await menuModel.findById(foodId); 
// //       if (!menuItem) {
// //         return res.status(404).json({ message: "Food item not found" });
// //       }
// //       cart.items.push({
// //         foodId,
// //         quantity,
// //         price: menuItem.price,
// //       });
// //     }

// //     // Recalculate total
// //     cart.totalPrice = cart.items.reduce(
// //       (total, item) => total + item.price * item.quantity,
// //       0
// //     );

// //     await cart.save();
// //     res.status(200).json({ message: "Item added to cart", cart });
// //   } catch (error) {
// //     console.error("Error adding to cart:", error);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

   

// // // Get user's cart
// // const getCart = async (req, res) => {
// //   try {
// //     const cart = await cartModel.findOne({ userId: req.user.id }).populate('items.foodId')

// //     if (!cart) {
// //       return res.status(404).json({ message: "Cart not found" });
// //     }
// //     res.json(cart);
// //   } catch (error) {
// //     console.error("Error fetching cart:", error);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // Remove item from cart
// // const removeFromCart = async (req, res) => {
// //     try {
// //         const userId = req.user.id;
// //         const { foodId } = req.body;

// //         const cart = await cartModel.findOne({ userId });
// //         if (!cart) {
// //             return res.status(404).json({ message: "Cart not found" });
// //         }

// //         cart.items = cart.items.filter(item => item.foodId.toString() !== foodId);
// //         cart.totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
// //         await cart.save();

// //         res.status(200).json({ message: "Item removed", data: cart });
// //     } catch (error) {
// //         res.status(500).json({ message: error.message });
// //     }
// // };

// // // Delete entire cart
// // const deleteCart = async (req, res) => {
// //     try {
// //         const userId = req.user.id;
// //         const cart = await cartModel.findOneAndDelete({ userId });

// //         if (!cart) {
// //             return res.status(404).json({ message: "Cart not found" });
// //         }

// //         res.status(200).json({ message: "Cart deleted successfully" });
// //     } catch (error) {
// //         res.status(500).json({ message: error.message });
// //     }
// // };

// // module.exports = { addToCart, getCart, removeFromCart, deleteCart };
// // const updateItem=async(req,res,next)=>{
// //     try {
// //         // collect the all data and the id of item that need to be updated
// //         const { itemName,description, price,category,itemAvailability,restaurant,foodImage}=req.body
// //              const {itemId}=req.params

             
// //            const cloudinaryPic = await cloudinary.uploader.upload(req.file.path);
// //            console.log(cloudinaryPic)

// //             //  updating the new value
// //         const updateItem=await menuModel.findByIdAndUpdate(itemId,{ itemName,description, price,category,itemAvailability,restaurant,foodImage:cloudinaryPic.url},{new:true})
// //         //    checking about the updation
// //         if (!updateItem) {
// //             return res.status(404).json({ success: false, message: "Item not found" });
// //         }

// //         res.json({ success: true, data: updateItem, message: "Updated item successfully" });
        
        
// //     } catch (error) {
// //         res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
// //     }
// // }
// // const createItem=async(req,res,next)=>{
// //     try {

// //         // collect data
// //         const { itemName,description, price,category,itemAvailability, restaurant,foodImage}=req.body
// //         //   checking the data
// //         if(! itemName ||!description || !price ||!category ||!itemAvailability||!restaurant){
// //             return res.status(400).json({message:"all fields required"})
// //            }

// //            const cloudinaryPic = await cloudinary.uploader.upload(req.file.path);
// //            console.log(cloudinaryPic)

// //         //   creating a new item
// //         const createItem=await menuModel.create({ itemName,description, price,category,itemAvailability,restaurant,foodImage:cloudinaryPic.url})
// //         createItem.save()
        
// //         res.json({ success:true, data:createItem , message:" items created successfully" })
// //     } catch (error) {
// //         res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
// //     }
// // }
// 