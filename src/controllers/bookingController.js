// src/controllers/bookingController.js
const Booking = require("../models/Booking");
const Slot = require("../models/Slot");

// Create a new booking
const createBooking = async (req, res) => {
  const { slotId } = req.body;
  const userId = req.user.userId;

  try {
    // Check if the slot is available
    const slot = await Slot.findById(slotId);
    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ message: "Slot is not available" });
    }

    // Create the booking
    const booking = new Booking({ userId, slotId });
    await booking.save();

    // Update the slot's availability
    slot.isAvailable = false;
    await slot.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings for a user
const getUserBookings = async (req, res) => {
  const userId = req.user.userId;

  try {
    const bookings = await Booking.find({ userId }).populate("slotId");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the booking belongs to the logged-in user
    if (booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Fetch the slot associated with the booking
    const slot = await Slot.findById(booking.slotId);
    if (slot) {
      // Check if there are any other bookings for the slot (excluding the one being canceled)
      const otherBookings = await Booking.find({
        slotId: slot._id,
        _id: { $ne: booking._id },
      });

      // If no other bookings exist, mark the slot as available
      if (otherBookings.length === 0) {
        slot.isAvailable = true;
        await slot.save();
      }
    }

    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      message: "Booking canceled successfully, slot is now available",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getUserBookings, cancelBooking };
