const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const Invoice = require("../models/Invoice");

//get user details
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("-password -__v");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "Role is required" });

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

