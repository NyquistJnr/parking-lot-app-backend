// controllers/slotController.js
const ParkingSlot = require("../models/ParkingSlot");

/**
 * @desc    Get the status of all parking slots (booked or not)
 * @route   GET /api/slots/status
 * @access  Public
 */
exports.getAllSlotsStatus = async (req, res) => {
  try {
    // Find all slots, include the username/email of the user if a slot is occupied, and sort them.
    const allSlots = await ParkingSlot.find({})
      .populate("occupiedBy", "username email")
      .sort({ slotNumber: 1 });
    res.json(allSlots);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all available (unoccupied) parking slots
 * @route   GET /api/slots/available
 * @access  Public
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const availableSlots = await ParkingSlot.find({ isOccupied: false }).sort({
      slotNumber: 1,
    });
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
