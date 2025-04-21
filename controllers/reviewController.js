const reviewModel=require("../model/reviewModel.js")
const restaurantModel=require("../model/restaurantModel.js")

const createReview=async(req,res,next)=>{
    try {
        const userId=req.user.id
    //    collecting data
        const { restaurantId, rating, comment } = req.body;

        // Validate required fields
        if (!restaurantId || !rating || !comment) {
            return res.status(400).json({ message: "All fields  are required" });
        }

        const resExist=await restaurantModel.findById(restaurantId)
        if(!resExist){
            return res.status(404).json({ message: "restaurant not exist" })
        }
         if(rating>5 || rating<1){
            return res.status(200).json({ message: "please provide proper rating" }) 
         }
        //  create or update the review

        const review=await reviewModel.findOneAndUpdate(
            { userId,restaurantId},{rating,comment},{new:true,upsert:true}
        )
    
       res.status(200).json({data:review,message:"your review is added"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
                    
    }
}

const getRestaurantReview=async(req,res,next)=>{
    try {
        const {restaurantId}=req.params

        if (!restaurantId) {
            return res.status(400).json({ message: "Restaurant ID is required" });
        }


        const review=await reviewModel.find({restaurantId}).populate("userId","name").sort({createdAt:-1})

        if(!review.length){
            return res.status(404).json({message:"no review found for this restaurant"})
        }
        return res.status(200).json({ data:review,message:"review found for this restaurant"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    }
}


const deleteReview=async(req,res,next)=>{
    try {
        const {reviewId}=req.params
        const userId=req.user.id

        const review=await reviewModel.findOneAndDelete({_id:reviewId,userId})
        if(!review){
            return res.status(404).json({message:"review not found"})
        }
         res.status(200).json({message:"review successfully deleted"})
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    }
}

const avgRating=async(req,res,next)=>{
    try {

        const {restaurantId}=req.params

        if (!restaurantId) {
            return res.status(400).json({ message: "Restaurant ID is required" });
        }
        const reviews=await reviewModel.find({restaurantId})
        
        if(!reviews.length){
            return res.status(404).json({message:"no review found for this restaurant"})
        }
        const avgRating=reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        res.status(200).json({data:avgRating,message:"avg rating calculated"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
 
    }
}
    

module.exports={createReview,getRestaurantReview,deleteReview,avgRating}