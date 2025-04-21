const menuModel=require( "../model/menuModel.js")
const cloudinary=require("../config/cloudinary.js")
const restaurantModel = require("../model/restaurantModel.js");

const getMenu=async(req,res,next)=>{
    try {
        // to get all menu items
        const menuItems=await menuModel.find().select("-category")
        res.status(200).json({data:menuItems, message:"Menu items retrieved successfully" })
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    }
}

const getSingleItem=async(req,res,next)=>{
    try {

        // collect the id of the single item
        const {itemId}=req.params
        // find the item
        const singleItem=await menuModel.findById(itemId)
        //  checking the  item
        if (!singleItem) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        res.status(200).json({ success:true, data:singleItem, message:"single items retrieved successfully" })
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    }
}

const createItem = async (req, res, next) => {
    try {
      const {
        itemName,
        description,
        price,
        category,
        itemAvailability,
        restaurant,
        foodImage,
      } = req.body;
  
      if (!itemName || !description || !price || !category || !itemAvailability || !restaurant) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      let finalImageURL = foodImage;
  
      // ✅ If file is uploaded, upload to Cloudinary
      if (req.file) {
        const cloudinaryPic = await cloudinary.uploader.upload(req.file.path);
        finalImageURL = cloudinaryPic.url;
      }
  
      // ✅ Check if we have an image URL now
      if (!finalImageURL) {
        return res.status(400).json({ message: "Please upload a file or provide an image URL." });
      }
  
      // ✅ Create the item
      const newItem = await menuModel.create({
        itemName,
        description,
        price,
        category,
        itemAvailability,
        restaurant,
        foodImage: finalImageURL,
      });
  
      res.json({ success: true, data: newItem, message: "Item created successfully" });
  
    } catch (error) {
      console.error("Create Item Error:", error); // <-- IMPORTANT
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  };
  

const updateItem = async (req, res, next) => {
    try {
      const { itemName, description, price, category, itemAvailability, restaurant } = req.body;
      const { itemId } = req.params;
  
      let updateData = {
        itemName,
        description,
        price,
        category,
        itemAvailability,
        restaurant,
      };
  
      if (req.file) {
        const cloudinaryPic = await cloudinary.uploader.upload(req.file.path);
        updateData.foodImage = cloudinaryPic.url;
      }
  
      const updatedItem = await menuModel.findByIdAndUpdate(itemId, updateData, { new: true });
  
      if (!updatedItem) {
        return res.status(404).json({ success: false, message: "Item not found" });
      }
  
      res.json({ success: true, data: updatedItem, message: "Updated item successfully" });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message || "internal server error" });
    }
  };
  

const deleteItem=async(req,res,next)=>{
    try {
        // collecting the id of item want to be delete
        const {itemId}=req.params

        // deleteing the item
        const deleteItem=await menuModel.findByIdAndDelete(itemId,{new:true})
        //   checking whether it is deleted
        if (!deleteItem) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        res.json({ success: true, data: deleteItem, message: "delete item successfully" });
        
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    }
}








module.exports={ getMenu,getSingleItem,createItem,updateItem,deleteItem}