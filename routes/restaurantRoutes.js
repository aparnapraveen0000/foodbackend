const express = require('express')
const { authUser } = require('../middlewares/authUser.js')
const { authSeller } = require('../middlewares/authSeller.js')
const { authAdmin } = require('../middlewares/authAdmin.js')
const {getRestaurant,postRestaurant, updateRestaurant,deleteRestaurant,AddRestaurant,getMenuOfRestaurant,getRestaurantsByMenuItem,updateSellerRestaurant,getSellerRestaurants }=require("../controllers/restaurantController.js")
const router = express.Router()

// Get all restaurants

router.get("/",authAdmin,getRestaurant)

// Get menu items of a restaurant
router.get("/menu/:restaurantId",authUser, getMenuOfRestaurant)

// Add a new restaurant
router.post("/restaurant",authAdmin,postRestaurant)


// seller need to Add a new restaurant
router.post("/addres",authSeller,AddRestaurant)



// Update a restaurant's details
router.put("/update/:restaurantId",authSeller, authAdmin, updateRestaurant)

// Remove a restaurant 
router.delete("/delete/:restaurantId",authAdmin,authSeller, deleteRestaurant)

router.get("/:restaurantId", getRestaurantsByMenuItem);


// Fetch restaurants created by the logged-in seller
router.get("/seller/myrestaurants", authSeller, getSellerRestaurants);

// Update a specific restaurant created by the seller
router.put("/seller/update/:restaurantId", authSeller, updateSellerRestaurant);


module.exports=router




	