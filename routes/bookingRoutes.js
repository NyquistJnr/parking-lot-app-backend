// routes/bookingRoutes.js
const express = require("express");
const {
  createBooking,
  getUserBookings,
  getAvailableSlots,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").post(protect, createBooking);
router.route("/my-bookings").get(protect, getUserBookings);
router.route("/available-slots").get(getAvailableSlots);

// New route for cancelling a booking
router.route("/:id/cancel").put(protect, cancelBooking);

module.exports = router;
