// routes/adminRoutes.js
const express = require("express");
const {
  getAllBookings,
  createParkingSlot,
  getAllParkingSlots,
  updateParkingSlot,
  deleteParkingSlot,
  createMultipleSlots, // Import the new controller
} = require("../controllers/adminController");

const { getAllUsers, deleteUser } = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/users").get(protect, admin, getAllUsers);

router.route("/users/:id").delete(protect, admin, deleteUser);

router.route("/bookings").get(protect, admin, getAllBookings);

// New route for bulk slot creation
router.route("/slots/bulk-create").post(protect, admin, createMultipleSlots);

router
  .route("/slots")
  .post(protect, admin, createParkingSlot)
  .get(protect, admin, getAllParkingSlots);

router
  .route("/slots/:id")
  .put(protect, admin, updateParkingSlot)
  .delete(protect, admin, deleteParkingSlot);

module.exports = router;
