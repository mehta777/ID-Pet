const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  ownerName: { type: String },
  ownerSurname: { type: String },
  address: { type: String },
  contact: { type: Number },
  whatsApp: { type: Number },
  email: { type: String },
  password: { type: String },
  otp: { type: Number },
  verifyStatus: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  createAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("User", userSchema);