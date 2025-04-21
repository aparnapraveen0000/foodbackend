const express = require('express')
const router = express.Router()
const{authUser}=require("../middlewares/authUser.js")

const {userSignup,userLogin,userProfile,updateUserProfile,userLogout,checkUser,DeleteUser, getAllUsers}=require("../controllers/userController.js")
const { authSeller } = require('../middlewares/authSeller.js')
const { authAdmin } = require('../middlewares/authAdmin.js')

// User Authentication
router.post("/signup",userSignup)

router.post("/login",userLogin)

router.post("/logout",userLogout)

// User Profile Management

router.get("/getProfile",authUser,userProfile)

router.put("/updateProfile",authUser,updateUserProfile)


router.get("/check",authUser,checkUser)

router.delete("/delete/:id", authAdmin, DeleteUser)

router.get("/all", authAdmin, getAllUsers)

module.exports=router

