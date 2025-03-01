// src/models/Slot.js
const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true, unique: true },
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model("Slot", slotSchema);
