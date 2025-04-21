const express = require('express')
const router = express.Router()
const {sellerSignup,sellerLogin,sellerProfile,updateSellerProfile,sellerLogout,sellerDeactivate,checkSeller,getSellerRestaurants,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,}=require("../controllers/sellerController.js")
const {authSeller}=require("../middlewares/authSeller.js")
const { upload} = require('../middlewares/multer.js')

router.post("/signup",sellerSignup)

router.post("/login",sellerLogin)

router.get("/profile",authSeller,sellerProfile)

router.put("/update",authSeller,updateSellerProfile)

router.post("/logout",sellerLogout)

router.put("/deactivate",authSeller,sellerDeactivate)

router.get("/check",authSeller,checkSeller)



// Route for fetching the seller’s restaurants and their menu items
router.get('/restaurants', authSeller, getSellerRestaurants);

// Route for adding a new menu item to a seller's restaurant
router.post('/menu/create', authSeller,upload.single("foodImage"),addMenuItem);

// Route for updating an existing menu item
router.put('/menu/update/:itemId', authSeller,upload.single("foodImage"),updateMenuItem);

// Route for deleting a menu item
router.delete('/menu/delete/:itemId', authSeller, deleteMenuItem);

module.exports=router
