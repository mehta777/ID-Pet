const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
  email: { type: String },
  otp: { type: Number },
  
  status: { type: Number, default: 1 },
  createAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("otp", otpSchema);

