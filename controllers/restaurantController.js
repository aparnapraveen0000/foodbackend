const restaurantModel=require( "../model/restaurantModel.js")
const menuModel=require( "../model/menuModel.js")

const getRestaurant=async(req,res,next)=>{
try {
    // to get all restaurants
    const restaurantList=await restaurantModel.find().select("-description")
    res.status(200).json({data:restaurantList,message:"restaurant list is successfully fetched"})
    
} catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    
}
}

const postRestaurant=async(req,res,next)=>{
  try {
      //    collect all data
      const{name,description,location, rating}=req.body

          //  check all the fields are fuilled
      if(!name||!description||!location?.address||!location?.city||!location?.state||!location?.pincode ||!rating){
          res.status(400).json({message:"all fields are required"})
      }
      // adding new restaurant
      const postRestaurant=await restaurantModel.create({name,description,location, rating})
      res.status(201).json({data:postRestaurant,message:"restaurant successfully created"})
      
  } catch (error) {
          res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
      
  }
  }
  // controllers/restaurantController.js



  const AddRestaurant = async (req, res, next) => {
    try {
      const sellerId = req.seller.id; // ✅ pulled from authSeller middleware
      const { name, description, location, rating } = req.body;
  
      if (
        !name ||
        !description ||
        !location?.address ||
        !location?.city ||
        !location?.state ||
        !location?.pincode ||
        !rating
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const newRestaurant = await restaurantModel.create({
        name,
        description,
        location,
        rating,
        sellerId, // ✅ this links the restaurant to the seller
      });
  
      res.status(201).json({
        data: newRestaurant,
        message: "Restaurant successfully created",
      });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  };
  


  
    const updateRestaurant=async(req,res,next)=>{
        try {
            //    collect all data
            const{name,description,location, rating}=req.body
            
            // getting id of restaurant
            const {restaurantId}=req.params
    
            //  updating restaurant details
            const updateRestaurant=await restaurantModel.findByIdAndUpdate(restaurantId,{name,description,location, rating},{new:true})

            //   checking the status of updation
            if (!updateRestaurant) {
                return res.status(404).json({ message: "Restaurant not found" });
            }
            res.status(200).json({data:updateRestaurant,message:"restaurant details updated"})
            
        } catch (error) {
                res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
            
        }
        }


        const deleteRestaurant=async(req,res,next)=>{
            try {
                
                // getting id of restaurant
                const {restaurantId}=req.params
        
                //  delete restaurant 
                const deleteRestaurant=await restaurantModel.findByIdAndDelete(restaurantId)

                // checking about the delete status
                if (!deleteRestaurant) {
                    return res.status(404).json({ message: "Restaurant not found" });
                }
        
                res.status(200).json({data:deleteRestaurant,message:"restaurant deleted"})
                
            } catch (error) {
                    res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
                
            }
            }

         
            

            const getMenuOfRestaurant=async(req,res,next)=>{
                try {
                  
                    // getting id of restaurant
                    const {restaurantId}=req.params
            
                    // Fetch menu items from the database
              const menuItems = await menuModel.find({ restaurant: restaurantId }).populate("restaurant")
                    // checking for menu list
                if (!menuItems.length) {
                return res.status(404).json({ message: "No menu items found for this restaurant" })
                  }

                    res.status(200).json({ data: menuItems, message: "Menu items retrieved successfully" })
        
                 
                } catch (error) {
                        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
                    
                }
                }

                
                const getRestaurantsByMenuItem = async (req, res, next) => {
                    try {
                        const { restaurantId } = req.params;  // ✅ Changed from itemId to restaurantId
                
                        // Find the restaurant directly
                        const restaurant = await restaurantModel.findById(restaurantId);
                        if (!restaurant) {
                            return res.status(404).json({ message: "Restaurant not found" });
                        }
                
                        // Find all menu items of this restaurant
                        const menuItems = await menuModel.find({ restaurant: restaurantId });
                
                        res.status(200).json({
                            data: {
                                restaurant,
                                menu: menuItems
                            },
                            message: "Restaurant and menu retrieved successfully"
                        });
                
                    } catch (error) {
                        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
                    }
                };
                
                const updateSellerRestaurant = async (req, res, next) => {
                  try {
                    const { name, description, location, rating } = req.body;
                    const { restaurantId } = req.params;
                    const sellerId = req.seller.id;
                
                    // Validate required fields
                    if (!name || !description || !location?.address || !location?.city || !location?.state || !location?.pincode || !rating) {
                      return res.status(400).json({ message: "All fields are required" });
                    }
                
                    // Check if restaurant exists and belongs to the seller
                    const restaurant = await restaurantModel.findOne({ _id: restaurantId, sellerId });
                    if (!restaurant) {
                      return res.status(403).json({ message: "Restaurant not found or you are not authorized to update it" });
                    }
                
                    // Validate rating
                    const ratingInt = parseInt(rating, 10);
                    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
                      return res.status(400).json({ message: "Rating must be a whole number between 1 and 5" });
                    }
                
                    // Update restaurant
                    const updatedRestaurant = await restaurantModel.findByIdAndUpdate(
                      restaurantId,
                      { name, description, location, rating: ratingInt },
                      { new: true }
                    );
                
                    res.status(200).json({ data: updatedRestaurant, message: "Restaurant updated successfully" });
                  } catch (error) {
                    res.status(500).json({ message: error.message || "Internal server error" });
                  }
                };  
                const getSellerRestaurants = async (req, res, next) => {
                  try {
                    const sellerId = req.seller.id;
                
                    const restaurants = await restaurantModel.find({ sellerId });
                
                    if (!restaurants || restaurants.length === 0) {
                      return res.status(404).json({ message: "No restaurant found for this seller" });
                    }
                
                    res.status(200).json({ data: restaurants, message: "Restaurants fetched successfully" });
                  } catch (error) {
                    res.status(500).json({ message: error.message || "Internal server error" });
                  }
                };
                

module.exports={getRestaurant,postRestaurant,updateRestaurant,deleteRestaurant,getMenuOfRestaurant,AddRestaurant,getRestaurantsByMenuItem,updateSellerRestaurant,getSellerRestaurants}