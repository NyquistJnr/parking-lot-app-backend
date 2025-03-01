const express = require("express");
const {
  getSlots,
  createSlot,
  updateSlot,
  deleteSlot,
} = require("../controllers/slotController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public route
router.get("/", getSlots);

// Protected routes (admin only)
router.post("/", authMiddleware, createSlot);
router.put("/:id", authMiddleware, updateSlot);
router.delete("/:id", authMiddleware, deleteSlot);

module.exports = router;
