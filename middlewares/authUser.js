const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        console.log("Token from cookies:", token); // For debugging

        if (!token) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { authUser };
