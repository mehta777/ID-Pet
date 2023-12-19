const mongoose = require ("mongoose")

const teacherSchema = new mongoose.Schema({
    teacherName:{type:String},
    teacherSurname:{type:String},
    address:{type:String},
    contact:{typeStrintg},
    whatsApp:{type:Number},
    password:{type:String},
    verifyStatus:{type:Number,default:0},
    status:{type:Number,default:0},
    createAt:{type:Date,default:Date.now}
})

module.exports = mongoose.model("teacher",teacherSchema)

