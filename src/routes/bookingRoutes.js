const express = require("express");
const {
  createBooking,
  getUserBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protected routes
router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getUserBookings);
router.delete("/:id", authMiddleware, cancelBooking);

module.exports = router;
