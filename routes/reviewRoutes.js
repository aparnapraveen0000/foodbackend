const express = require('express')
const router = express.Router()
const{createReview,getRestaurantReview,deleteReview,avgRating}=require("../controllers/reviewController")
const{authUser}=require("../middlewares/authUser.js")


// create a review
router.put("/",authUser,createReview)

// get all the review
router.get("/get/:restaurantId",getRestaurantReview)

// delete a review
router.delete("/delete/:reviewId",authUser,deleteReview)

// to get avg rating
router.get("/avgRating/:restaurantId",avgRating)

module.exports=router