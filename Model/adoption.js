const mongoose = require("monoose")

const adoptionSchema = new mongoose.Schema({ 
    dogId:{type:mongoose.Schema.Types.ObjectId,ref:"dog"},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    status:{type:Number,default:1},
    createAt:{type:Date,default:Date.now}
})

module.exports = mongoose.model("adoption",adoptionSchema)     