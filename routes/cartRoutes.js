const express = require("express");
const router = express.Router()
const{authUser}=require("../middlewares/authUser.js")
const{addToCart, getCart, removeFromCart, deleteCart,getUserCart}=require("../controllers/cartController.js")

// add item to cart
router.post("/add",authUser,addToCart)

// get item from cart
router.get("/get",authUser,getCart)

// / Remove item from cart
router.put("/remove",authUser,removeFromCart)

// 
// Delete entire cart
router.delete("/delete",authUser,deleteCart)

router.get('/items', authUser, getUserCart);

module.exports=router
