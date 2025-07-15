// models/ParkingSlot.js
const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: { type: String, required: true, unique: true },
    isOccupied: { type: Boolean, default: false },
    occupiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const ParkingSlot = mongoose.model("ParkingSlot", parkingSlotSchema);
module.exports = ParkingSlot;
