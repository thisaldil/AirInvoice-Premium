const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ message: "Authentication token is required" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Authentication token has expired" });
        }

        return res.status(401).json({ message: "Invalid authentication token" });
    }

    try {
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Authenticated user was not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication middleware error:", error);
        return res.status(500).json({ message: "Unable to authenticate user" });
    }
};

module.exports = authenticateToken;
