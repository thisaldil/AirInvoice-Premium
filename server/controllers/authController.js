const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createUser = async (payload) => {
    const googleId = payload.sub;
    const imageUrl = payload.picture;

    const user = new User({
        googleId,
        name: payload.name,
        email: payload.email,
        picture: imageUrl
    });

    await user.save();
    return user;
};

const handleGoogleRedirect = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    await User.findByIdAndUpdate(req.user._id, { token });

    res.status(200).json({ message: "Authentication successful", user: req.user, token });
};

const handleGoogleToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token missing" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;

        let user = await User.findOne({ googleId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

        await User.findByIdAndUpdate(user._id, { token: jwtToken });

        res.status(200).json({
            message: "Authentication successful",
            user: {
                googleId: user.googleId,
                name: user.name,
                email: user.email,
                picture: user.picture,
            },
            token: jwtToken,
            userId: user._id,
        });
    } catch (error) {
        console.error("Google Token Handling Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const handleGoogleRegister = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token missing" });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const existingUser = await User.findOne({ googleId: payload.sub });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const user = await createUser({
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
        });

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        await User.findByIdAndUpdate(user._id, { token: jwtToken });

        res.status(200).json({
            message: "Registration successful",
            user: {
                googleId: user.googleId,
                name: user.name,
                email: user.email,
                picture: user.picture,
            },
            token: jwtToken,
            userId: user._id,
        });
    } catch (error) {
        console.error("Google Register Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.password) {
            return res.status(400).json({ message: "This account uses Google login. Please sign in with Google." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

        await User.findByIdAndUpdate(user._id, { token });

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            message: "Login successful",
            user: userObj,
            token,
            userId: user._id,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const handleRegister = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        res.status(201).json({ message: "User created successfully", user: userObj });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    handleGoogleRedirect,
    handleGoogleToken,
    handleGoogleRegister,
    createUser,
    handleLogin,
    handleRegister
};