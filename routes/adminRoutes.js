const express = require('express')
const router = express.Router()
const {authAdmin}=require("../middlewares/authAdmin.js")
const {adminSignup,adminLogin,adminProfile,updateAdminProfile,adminLogout,adminDeactivate,checkAdmin}=require("../controllers/adminController.js")

//  admin signup
router.post("/signup",adminSignup)

// admin login
router.post("/login",adminLogin)

// admin logout
router.post("/logout",adminLogout)

//  to get admin profile
router.get("/profile",authAdmin,adminProfile)  

// update admin profile                
router.put("/update",authAdmin,updateAdminProfile)

// check admin
router.get("/check",authAdmin,checkAdmin)

// deactivate admin
router.put("/deactivate",authAdmin,adminDeactivate)



module.exports=router

