// controllers/bookingController.js
const Booking = require("../models/Booking");
const ParkingSlot = require("../models/ParkingSlot");
const qrcode = require("qrcode");

/**
 * @desc    Create a new booking and generate a detailed QR code
 * @route   POST /api/bookings
 * @access  Private
 */
exports.createBooking = async (req, res) => {
  const { parkingSlotId, startTime, endTime } = req.body;
  try {
    const slot = await ParkingSlot.findById(parkingSlotId);
    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }
    if (slot.isOccupied) {
      return res
        .status(400)
        .json({ message: "Parking slot is already occupied" });
    }

    const booking = new Booking({
      user: req.user.id,
      parkingSlot: parkingSlotId,
      startTime,
      endTime,
    });

    let createdBooking = await booking.save();

    // Mark the slot as occupied
    slot.isOccupied = true;
    slot.occupiedBy = req.user.id;
    await slot.save();

    // --- QR Code Generation with Full Details ---
    // 1. Populate user and parkingSlot details from the created booking
    createdBooking = await createdBooking.populate([
      { path: "user", select: "username email" },
      { path: "parkingSlot", select: "slotNumber" },
    ]);

    // 2. Construct a clean object with all necessary details for the QR code
    const qrCodeDetails = {
      bookingId: createdBooking._id,
      username: createdBooking.user.username,
      email: createdBooking.user.email,
      slotNumber: createdBooking.parkingSlot.slotNumber,
      startTime: createdBooking.startTime.toISOString(),
      endTime: createdBooking.endTime.toISOString(),
      bookedAt: createdBooking.createdAt.toISOString(),
    };

    // 3. Convert the details object to a JSON string to embed in the QR code
    const qrCodeDataString = JSON.stringify(qrCodeDetails, null, 2); // Pretty print JSON
    const qrCodeDataUrl = await qrcode.toDataURL(qrCodeDataString);

    // 4. Send the response including the full booking object and the new detailed QR code
    res.status(201).json({
      ...createdBooking.toObject(),
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- Other booking controller functions remain the same ---

/**
 * @desc    Cancel a booking within 2 minutes of creation
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "User not authorized to cancel this booking" });
    }
    if (booking.status !== "booked") {
      return res
        .status(400)
        .json({ message: `Booking has already been ${booking.status}` });
    }
    const bookingTime = new Date(booking.createdAt).getTime();
    const currentTime = new Date().getTime();
    const timeDifferenceInMinutes = (currentTime - bookingTime) / (1000 * 60);

    if (timeDifferenceInMinutes > 2) {
      return res
        .status(400)
        .json({ message: "Cancellation window (2 minutes) has passed." });
    }

    booking.status = "cancelled";
    await booking.save();

    await ParkingSlot.findByIdAndUpdate(booking.parkingSlot, {
      isOccupied: false,
      occupiedBy: null,
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get logged in user's bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("parkingSlot", "slotNumber")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all available parking slots
 * @route   GET /api/bookings/available-slots
 * @access  Public
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const availableSlots = await ParkingSlot.find({ isOccupied: false });
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
