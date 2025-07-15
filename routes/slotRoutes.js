// routes/slotRoutes.js
const express = require("express");
const {
  getAllSlotsStatus,
  getAvailableSlots,
} = require("../controllers/slotController");
const router = express.Router();

// Route to get the status of ALL slots
router.get("/status", getAllSlotsStatus);

// Route to get only AVAILABLE slots
router.get("/available", getAvailableSlots);

module.exports = router;
