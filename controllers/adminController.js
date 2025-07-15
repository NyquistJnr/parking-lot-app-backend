// controllers/adminController.js
const Booking = require("../models/Booking");
const ParkingSlot = require("../models/ParkingSlot");
const User = require("../models/User");

/**
 * @desc    Create multiple parking slots at once (admin)
 * @route   POST /api/admin/slots/bulk-create
 * @access  Private/Admin
 */
exports.createMultipleSlots = async (req, res) => {
  // Expects a body like: { "prefix": "C", "startNumber": 1, "count": 20 }
  const { prefix, startNumber, count } = req.body;

  if (!prefix || !startNumber || !count) {
    return res
      .status(400)
      .json({ message: "Please provide a prefix, startNumber, and count." });
  }

  try {
    const newSlotsData = [];
    const existingSlotNumbers = [];
    const createdSlotNumbers = [];

    // Generate the list of desired slot numbers
    const desiredSlotNumbers = [];
    for (let i = 0; i < count; i++) {
      desiredSlotNumbers.push(`${prefix}${startNumber + i}`);
    }

    // Find which of the desired slots already exist in the DB
    const existingSlots = await ParkingSlot.find({
      slotNumber: { $in: desiredSlotNumbers },
    }).select("slotNumber");
    const existingSet = new Set(existingSlots.map((slot) => slot.slotNumber));

    // Prepare the array for bulk insertion, filtering out existing slots
    for (const slotNum of desiredSlotNumbers) {
      if (!existingSet.has(slotNum)) {
        newSlotsData.push({ slotNumber: slotNum });
        createdSlotNumbers.push(slotNum);
      } else {
        existingSlotNumbers.push(slotNum);
      }
    }

    // Perform bulk insertion if there are any new slots to create
    if (newSlotsData.length > 0) {
      await ParkingSlot.insertMany(newSlotsData);
    }

    res.status(201).json({
      message: "Bulk slot creation process completed.",
      created: createdSlotNumbers,
      skipped_duplicates: existingSlotNumbers,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error during bulk creation",
        error: error.message,
      });
  }
};

// --- Other admin controller functions remain the same ---

/**
 * @desc    Get all bookings (admin)
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "username email")
      .populate("parkingSlot", "slotNumber")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Create a new parking slot (admin)
 * @route   POST /api/admin/slots
 * @access  Private/Admin
 */
exports.createParkingSlot = async (req, res) => {
  const { slotNumber } = req.body;
  try {
    const slotExists = await ParkingSlot.findOne({ slotNumber });
    if (slotExists) {
      return res
        .status(400)
        .json({ message: "Parking slot with this number already exists" });
    }
    const slot = await ParkingSlot.create({ slotNumber });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all parking slots (admin)
 * @route   GET /api/admin/slots
 * @access  Private/Admin
 */
exports.getAllParkingSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find({}).sort({ slotNumber: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update a parking slot (admin)
 * @route   PUT /api/admin/slots/:id
 * @access  Private/Admin
 */
exports.updateParkingSlot = async (req, res) => {
  const { slotNumber, isOccupied } = req.body;
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (slot) {
      slot.slotNumber = slotNumber || slot.slotNumber;
      if (isOccupied !== undefined) {
        slot.isOccupied = isOccupied;
        if (isOccupied === false) {
          slot.occupiedBy = null;
        }
      }
      const updatedSlot = await slot.save();
      res.json(updatedSlot);
    } else {
      res.status(404).json({ message: "Parking slot not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a parking slot (admin)
 * @route   DELETE /api/admin/slots/:id
 * @access  Private/Admin
 */
exports.deleteParkingSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (slot) {
      const activeBooking = await Booking.findOne({
        parkingSlot: slot._id,
        status: "booked",
      });
      if (activeBooking) {
        return res
          .status(400)
          .json({ message: "Cannot delete slot with an active booking." });
      }
      await slot.deleteOne();
      res.json({ message: "Parking slot removed" });
    } else {
      res.status(404).json({ message: "Parking slot not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
