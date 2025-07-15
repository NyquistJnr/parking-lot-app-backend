// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Generates a JWT token for a user.
 * @param {string} id - The user ID.
 * @param {string} role - The user role.
 * @returns {string} The generated JWT token.
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ username, email, password, role });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    // req.user is set by the 'protect' middleware
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Critical check: Prevent an admin from deleting their own account
    if (user._id.toString() === req.user.id.toString()) {
      return res
        .status(400)
        .json({ message: "Admin cannot delete their own account." });
    }

    // Optional: Add logic here to handle user's existing bookings if needed
    // For example, you might want to cancel them or reassign them.
    // For now, we will just delete the user.

    await user.deleteOne();
    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Build a filter object based on the query parameter
    const filter = {};
    if (req.query.role) {
      // Validate the role query parameter
      if (["user", "admin"].includes(req.query.role)) {
        filter.role = req.query.role;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid role specified. Use 'user' or 'admin'." });
      }
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
