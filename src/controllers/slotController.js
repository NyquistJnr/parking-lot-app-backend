// src/controllers/slotController.js
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");

const getSlots = async (req, res) => {
  try {
    // Fetch all slots
    const slots = await Slot.find();

    // For each slot, find the corresponding booking and include booking ID
    const slotsWithBooking = await Promise.all(
      slots.map(async (slot) => {
        const booking = await Booking.findOne({ slotId: slot._id }).select(
          "_id"
        );
        return { ...slot.toObject(), bookingId: booking ? booking._id : null };
      })
    );

    res.json(slotsWithBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSlot = async (req, res) => {
  const { slotNumber } = req.body;
  try {
    const slot = new Slot({ slotNumber });
    await slot.save();
    res.status(201).json(slot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a slot
const updateSlot = async (req, res) => {
  try {
    const { slotNumber } = req.body;
    const slot = await Slot.findByIdAndUpdate(
      req.params.id,
      { slotNumber },
      { new: true }
    );
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a slot by ID
const deleteSlot = async (req, res) => {
  try {
    // Fetch the slot ID from the request parameters
    const slotId = req.params.id;

    // Try to find and delete the slot by the provided ID
    const slot = await Slot.findByIdAndDelete(slotId);

    // If no slot was found with the given ID, send a 404 error
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Send a success message if the slot was deleted
    res.json({ message: "Slot deleted successfully" });
  } catch (error) {
    // If there is a server error, send a 500 error
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSlots, createSlot, updateSlot, deleteSlot };
