const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const authUser = async (req, res, next) => {
    try {
        // Extract token from cookies
        const token = req.cookies.token;
        console.log("Token received from cookies:", token);  // For debugging

        // If no token is found, return authentication error
        if (!token) {
            console.log("No token found, user not authenticated.");
            return res.status(401).json({ message: "Authentication token is missing" });
        }

        // Verify the token using the secret key from environment variables
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Fetch the user associated with the token (excluding password)
        req.user = await User.findById(decoded.id).select("-password");

        // If user not found, return error
        if (!req.user) {
            console.log("User not found with ID:", decoded.id);
            return res.status(401).json({ message: "User not found" });
        }

        // If everything is fine, proceed with the next middleware
        next();
    } catch (error) {
        // Log the error and send a response indicating invalid token
        console.error("Auth Error:", error);
        return res.status(401).json({ message: "Invalid or expired token", error: error.message });
    }
};

module.exports = { authUser };
