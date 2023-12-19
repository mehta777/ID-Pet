const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema({
  dogId: { type: mongoose.Schema.Types.ObjectId, ref: "dog" },
  dogInstitute: { type: String },
  address: { type: String },
  contact: { type: Number },
  status: { type: Number, default: 0 },
  createAt: { type: Date, default: Date.now },
}); 


 module.exports = mongoose.model ("institute",instituteSchema)  