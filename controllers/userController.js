const bcrypt =require("bcryptjs");
const userModel = require("../model/userModel.js");
const { generateToken } = require("../utils/token.js");

// User Signup
const userSignup = async (req, res, next) => {
    try {
        // Collect user data
        const { name, email, password, mobile, address, confirmPassword, profilePic } = req.body;

        // Data validation
        if (!name || !email || !password || !mobile || !address || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const userExist = await userModel.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "This user already exists" });
        }

        // Compare password and confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Save user to DB
        const newUser = new userModel({ name, email, password: hashedPassword, mobile, address, profilePic });
        await newUser.save();

        // Generate token
        const token = generateToken(newUser._id, "user");

        // Set token as a cookie
        res.cookie("token", token, {
            httpOnly: false, 
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            expires: new Date(Date.now() + 60 * 60 * 1000) // 1-hour expiry
        });

        res.json({ data: newUser, message: "Signup successful" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
};

// User Login
const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await userModel.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        const passwordMatch = bcrypt.compareSync(password, userExist.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!userExist.isActive) {
            return res.status(403).json({ message: "User account is not active" });
        }

        const token = generateToken(userExist._id, "user");

        res.cookie("token", token, {
            httpOnly: true, // Set to false so frontend can access it if needed
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            expires: new Date(Date.now() + 60 * 60 * 1000),
        });

        const userData = await userModel.findById(userExist._id).select("-password");

        // Include token in the response
        res.json({ 
            data: userData, 
            token: token, // Add token here
            message: "Login successful" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
};

// User Profile
const userProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userData = await userModel.findById(userId).select("-password");

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ data: userData, message: "User profile fetched" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
};

// Update User Profile
const updateUserProfile = async (req, res, next) => {
    try {
        const { name, email, password, mobile, address, profilePic } = req.body;
        const userId = req.user.id;

        const updateData = { name, email, mobile, address, profilePic };

        // Hash new password if provided
        if (password) {
            updateData.password = bcrypt.hashSync(password, 10);
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ data: updatedUser, message: "User profile updated" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
};

// User Logout
const userLogout = async (req, res, next) => {
    try {
        res.clearCookie("token", { sameSite: "None", secure: true });
        res.json({ message: "User logged out" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
        console.log(error);
    }
};

// Check User Authorization
const checkUser = async (req, res, next) => {
    try {
        res.json({ message: "User authorized" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const DeleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const deletedUser = await userModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully", data: deletedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userModel.find().select("-password"); 
        res.json({ data: users, message: "All users fetched successfully" });
    } catch (error) {
        console.log("Error fetching users:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};



module.exports = { 
    userSignup, 
    userLogin, 
    userProfile, 
    updateUserProfile, 
    userLogout, 
   checkUser,
   DeleteUser,
   getAllUsers 
};
