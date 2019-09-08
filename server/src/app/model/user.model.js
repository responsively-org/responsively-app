const mongoose = require('mongoose')
let Schema=mongoose.Schema

const subscriptionSchema=new Schema({
    type: {type: String},
    valid_till: {type: Date},
    start_date:{type: Date}
},{_id: false})

const userSchema=new Schema({
    name: {type: String},
    email: {type: String},
    license_key:{type: String},
    subscription: subscriptionSchema,
    c_ts: Date,
    u_ts: Date
})

let USER_MODEL_NAME='User'
let COLLECTION_NAME='users'
let User=mongoose.model(USER_MODEL_NAME,userSchema,COLLECTION_NAME)
module.exports=User