const mongoose = require("mongoose");
const dogSchema = new mongoose.Schema({
  bannerImage: { type: String },
  profileImage: { type: String },
  petName: { type: String },
  petGender: { type: String },
  petBreed: { type: String },
  dateOfBirth: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dogDescription: { type: String },
  status: { type: Number, deafault: 1 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("dog", dogSchema);   