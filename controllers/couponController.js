const couponModel=require("../model/couponModel.js")

const createCoupon=async (req, res,next) => {
    try {
        const { code, discountValue, minOrderAmount, validFrom, validTo, couponIsActive } = req.body;

        const existingCoupon = await couponModel.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const newCoupon = new couponModel({ code, discountValue, minOrderAmount, validFrom, validTo, couponIsActive });
        await newCoupon.save();

        res.status(201).json({ message: 'Coupon created successfully', data: newCoupon });
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    }
}

const getCoupon=async (req, res,next) => {
    try {
        const coupons = await couponModel.find();
        return res.status(200).json({data:coupons,message:"all coupon get successfully"});
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    }
}

const updateCoupon=async (req, res,next) => {
    try {
        const{couponId}=req.params
        const { code, discountValue, minOrderAmount, validFrom, validTo, couponIsActive } = req.body;

        const updateCoupon=await couponModel.findByIdAndUpdate(couponId,{ code, discountValue, minOrderAmount, validFrom, validTo, couponIsActive},{new:true})
        if(!updateCoupon){
            return res.status(404).json({ message: 'coupon not found' });  
        }
        res.status(200).json({data:updateCoupon,message:"coupon updated successfully"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
    }
}

const deleteCoupon=async (req, res,next) => {
try {
    const{couponId}=req.params
    
    const deleteCoupon=await  couponModel.findByIdAndDelete(couponId)

    if(!deleteCoupon){
      return  res.status(404).json({message:"coupon not found"})
    } 
    res.status(200).json({data:deleteCoupon,message:"coupon deleted successfully"})
        
    
} catch (error) {
    res.status(error.statusCode || 500).json({message:error.message||"internal server error"})
}
}

const getAllCouponsForAdmin = async (req, res, next) => {
    try {
      const coupons = await couponModel.find();
      return res.status(200).json({ data: coupons, message: "All coupons fetched by admin successfully" });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
  };
  
  const applyCoupon = async (req, res, next) => {
    try {
      const { code, cartTotal } = req.body;
  
      // Find the coupon by code
      const coupon = await couponModel.findOne({ code });
  
      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }
  
      // Check if the coupon is active
      if (!coupon.couponIsActive) {
        return res.status(400).json({ message: "Coupon is not active" });
      }
  
      // Check if the coupon is within the valid date range
      const currentDate = new Date();
      const validFromDate = new Date(coupon.validFrom).setHours(0, 0, 0, 0); // Normalize the date to remove time
      const validToDate = new Date(coupon.validTo).setHours(23, 59, 59, 999); // Normalize the date to remove time
  
      if (currentDate < validFromDate || currentDate > validToDate) {
        return res.status(400).json({ message: "Coupon is not valid at this time" });
      }
  
      // Check if the cart total meets the minimum order amount
      if (cartTotal < coupon.minOrderAmount) {
        return res.status(400).json({ message: `Minimum order amount of $${coupon.minOrderAmount} is required to apply this coupon` });
      }
  
      // Calculate the discount
      const discount = (cartTotal * coupon.discountValue) / 100;
      const discountedTotal = cartTotal - discount;
  
      return res.status(200).json({
        message: "Coupon applied successfully",
        discountValue: discount,
        discountedTotal,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
  };
  
  module.exports = { createCoupon, getCoupon, updateCoupon, deleteCoupon, getAllCouponsForAdmin, applyCoupon };