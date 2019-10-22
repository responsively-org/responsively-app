const mongoose = require('mongoose')
let Schema=mongoose.Schema

const userSchema=new Schema({
    name: {type: String},
    email: {type: String},
    license_key: {type: String},
    razorpay_id: {type: String},
    c_ts: Date,
    u_ts: Date
})

const USER_MODEL_NAME='User'
const COLLECTION_NAME='users'
const User=mongoose.model(USER_MODEL_NAME,userSchema,COLLECTION_NAME)
module.exports=User