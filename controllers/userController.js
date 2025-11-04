import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ---------------------------------------------
// REGISTER (Create new user)
// ---------------------------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check for existing email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "driver"
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({ error: messages });
    }
    res.status(400).json({ error: err.message });
  }
};

// ---------------------------------------------
// LOGIN
// ---------------------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Compare password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ---------------------------------------------
// READ: Get all users (admin-only later)
// ---------------------------------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------------------------
// SEARCH: Find users by name or readable userId
// ---------------------------------------------
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Search by partial name (case-insensitive) or exact userId
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { userId: query.toUpperCase() }
      ]
    }).select("-password");

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------------------------
// UPDATE: Update user by readable userId
// ---------------------------------------------
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params; // now uses readable userId
    const { name, email, phone, role, password } = req.body;
    const updatedData = { name, email, phone, role };

    if (password) updatedData.password = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate({ userId }, updatedData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ---------------------------------------------
// DELETE: Delete user by readable userId
// ---------------------------------------------
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOneAndDelete({ userId });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: `User ${userId} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------------------------
// DELETE: Delete user by name (case-insensitive)
// ---------------------------------------------
export const deleteUserByName = async (req, res) => {
  try {
    const { name } = req.params;

    // Case-insensitive search for name
    const user = await User.findOneAndDelete({
      name: { $regex: `^${name}$`, $options: "i" } // exact name match, case-insensitive
    });

    if (!user) {
      return res.status(404).json({ error: `User '${name}' not found` });
    }

    res.json({
      message: `User '${user.name}' (${user.userId}) deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

