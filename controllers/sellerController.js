const bcrypt = require("bcryptjs");
const sellerModel=require("../model/sellerModel.js")
const restaurantModel = require('../model/restaurantModel.js');
const menuModel = require('../model/menuModel.js');
const fs = require('fs').promises;
const cloudinary=require("../config/cloudinary.js")
const {generateToken}=require("../utils/token.js")

const sellerSignup=async(req,res,next)=>{
    try {
  // collect seller data
   const{name,email,password,mobile,address,confirmPassword,businessName}=req.body

  //  data validation
  if(!name||!email|| !password||!mobile||!address||!confirmPassword||!businessName){
   return res.status(400).json({message:"all fields required"})
  }
  //  check if alreary exist

  const sellerExist=await sellerModel.findOne({email:email})

  if(sellerExist){
    return res.status(400).json({message:"this seller is alreay exist"})
  }

  // compair password and confir password
  if(password!==confirmPassword){
    return res.status(400).json({message:"password is not same"}) 
  }
// password hashing
  const hashedPassword = bcrypt.hashSync(password,10)

  // save to db
  const newSeller= new sellerModel({name,email,password:hashedPassword,mobile,address,confirmPassword,businessName})
  await newSeller.save()

  // generate token using id and role

const token=generateToken(newSeller._id,"seller")
res.cookie("token",token)

res.json({data:newSeller,message:"signup success"})

}
    
  catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
        console.log(error)
    }
}

const sellerLogin=async(req,res,next)=>{
  try{
    // collecting sellerdata
    const{email,password}=req.body
     //  data validation
   if(!email|| !password){
   return res.status(400).json({message:"all fields required"})
  }
// seller exist checking
  const sellerExist=await sellerModel.findOne({email:email})
  if(!sellerExist){
    return res.status(404).json({message:" seller not found"})
  }

  // password match with db
  const passwordMatch =bcrypt.compareSync(password,sellerExist.password)
 if(!passwordMatch){
  return res.status(401).json({message:"invalid credentials"})
 }

 if(!sellerExist.isActive){
  return res.status(404).json({message:" seller account is not active"})
 }

  // generate token
  const token=generateToken(sellerExist._id,"seller")
  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: "lax",
  });

  // to remove password from sellerExist and send other details to frontend
  
  delete sellerExist._doc.password
  res.json({data:sellerExist,message:"login success"})

  }

  catch (error) {
    res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    console.log(error)

}
}

const sellerProfile=async (req,res,next)=>{
try{
  const sellerId=req.seller.id
  const sellerData=await sellerModel.findById(sellerId).select("-password")

  res.json({data:sellerData,message:"seller profile fetched"})
  
}catch (error) {
    res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    console.log(error)

}

}

const updateSellerProfile=async (req,res,next)=>{
try{
  const{name,email,password,mobile,address,confirmPassword,businessName,profilePic}=req.body
  const sellerId=req.seller.id
  const sellerData=await sellerModel.findByIdAndUpdate(sellerId,{name,email,password,mobile,address,confirmPassword,businessName,profilePic},{new:true})

  res.json({data:sellerData,message:"seller profile updated"})
}
catch (error) {
  res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
  console.log(error)

}

}

const sellerLogout=async (req,res,next)=>{
try{
      res.clearCookie("token")
      res.json({message:"seller logout"})
}
catch (error) {
  res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
  console.log(error)

}
}
  

const sellerDeactivate=async(req,res,next)=>{
  try {
    
    const sellerId = req.seller.id; 

    // Update the isActive status to false
    const seller = await sellerModel.findByIdAndUpdate(sellerId, { isActive: false }, { new: true });

    if (!seller) {
      return res.status(404).json({ message: "seller not found" });
    }

    res.json({ message: "Account deactivated successfully", seller });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}


const checkSeller=async(req,res,next)=>{
  try{
     res.json({message:"seller autherized"})
  }
  catch (error) {
    res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
     }
}



// Controller to fetch the seller’s restaurants along with their menu items
// sellerController.js
const getSellerRestaurants = async (req, res, next) => {
  try {
    const sellerId = req.seller.id;

    // Fetch restaurants for the seller
    const restaurants = await restaurantModel.find({ sellerId });

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({ message: "No restaurants found for this seller" });
    }

    // Fetch menu items for each restaurant
    const restaurantIds = restaurants.map((r) => r._id);
    const menuItems = await menuModel.find({ restaurant: { $in: restaurantIds } });

    // Combine restaurants with their menu items
    const restaurantsWithMenus = restaurants.map((restaurant) => ({
      ...restaurant.toObject(),
      menu: menuItems.filter((item) => item.restaurant.toString() === restaurant._id.toString()),
    }));

    res.status(200).json({ data: restaurantsWithMenus, message: "Restaurants and menus fetched successfully" });
  } catch (error) {
    console.error("Error in getSellerRestaurants:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Controller to add a new menu item to a seller's restaurant
const addMenuItem = async (req, res, next) => {
  try {
    const { itemName, description, price, category, itemAvailability, restaurantId, foodImage } = req.body;
    const sellerId = req.seller.id;

    if (!itemName || !description || !price || !category || !itemAvailability || !restaurantId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the restaurant belongs to the seller
    const restaurant = await restaurantModel.findOne({ _id: restaurantId, sellerId });
    if (!restaurant) {
      return res.status(403).json({ message: "Restaurant not found or you are not authorized to add a menu item" });
    }

    let finalImageURL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwZgTsV5FSzcygnwaRW4SePUSXSiNZCdYUhw&s"; // Default image
    if (req.file) {
      const cloudinaryPic = await cloudinary.uploader.upload(req.file.path);
      finalImageURL = cloudinaryPic.url;
    } else if (foodImage && typeof foodImage === "string" && foodImage.trim() !== "") {
      finalImageURL = foodImage; // Use provided URL
    }

    const newItem = new menuModel({
      itemName,
      description,
      price: parseFloat(price),
      category,
      itemAvailability,
      restaurant: restaurantId,
      foodImage: finalImageURL,
    });

    await newItem.save();
    res.status(201).json({ data: newItem, message: "Menu item created successfully" });
  } catch (error) {
    console.error("Error in addMenuItem:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// Controller to update an existing menu item


const updateMenuItem = async (req, res, next) => {
  try {
    const { itemName, description, price, category, itemAvailability, restaurantId, foodImage } = req.body;
    const { itemId } = req.params;
    const sellerId = req.seller.id;

    // Check if the menu item exists
    const menuItem = await menuModel.findOne({ _id: itemId, restaurant: restaurantId });
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Check if the restaurant belongs to the seller
    const restaurant = await restaurantModel.findOne({ _id: restaurantId, sellerId });
    if (!restaurant) {
      return res.status(403).json({ message: "You are not authorized to update this item" });
    }

    // Validate price
    let parsedPrice;
    if (price) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
      }
    }

    // Handle image update
    let finalImageURL = menuItem.foodImage; // Keep existing image by default
    if (req.file) {
      const cloudinaryPic = await cloudinary.uploader.upload(req.file.path);
      finalImageURL = cloudinaryPic.url;
      await fs.unlink(req.file.path).catch((err) => console.error("Failed to delete temp file:", err));
    } else if (foodImage && typeof foodImage === "string" && foodImage.trim() !== "") {
      const urlPattern = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg)$/i;
      if (!urlPattern.test(foodImage)) {
        return res.status(400).json({ message: "Invalid image URL" });
      }
      finalImageURL = foodImage;
    }

    // Prepare update data (only include provided fields)
    const updateData = {};
    if (itemName) updateData.itemName = itemName;
    if (description) updateData.description = description;
    if (price) updateData.price = parsedPrice;
    if (category) updateData.category = category;
    if (itemAvailability !== undefined) updateData.itemAvailability = itemAvailability;
    if (restaurantId) updateData.restaurant = restaurantId;
    if (finalImageURL !== menuItem.foodImage) updateData.foodImage = finalImageURL;

    // Update the menu item
    const updatedItem = await menuModel.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true }
    );

    res.status(200).json({ data: updatedItem, message: "Menu item updated successfully" });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch((err) => console.error("Failed to delete temp file:", err));
    }
    console.error("Error in updateMenuItem:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


// Controller to delete a menu item
const deleteMenuItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const sellerId = req.seller.id;

    // Check if the menu item exists
    const menuItem = await menuModel.findById(itemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Check if the restaurant belongs to the seller
    const restaurant = await restaurantModel.findOne({ _id: menuItem.restaurant, sellerId });
    if (!restaurant) {
      return res.status(403).json({ message: "You are not authorized to delete this item" });
    }

    // Delete the menu item
    await menuModel.findByIdAndDelete(itemId);
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};




module.exports={sellerSignup,sellerLogin,sellerProfile,updateSellerProfile,sellerLogout,sellerDeactivate,checkSeller,getSellerRestaurants, addMenuItem, updateMenuItem, deleteMenuItem}