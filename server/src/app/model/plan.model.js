const mongoose = require('mongoose')
let Schema=mongoose.Schema

const planSchema=new Schema({
    _id: {type: String},
    name: {type: String},
    user_limit: {type: Number},
    c_ts: {type: Date},
    u_ts: {type: Date},
    price: {type: String}
})

const PLAN_MODEL_NAME='Plan'
const COLLECTION_NAME='plans'
const Plan=mongoose.model(PLAN_MODEL_NAME,planSchema,COLLECTION_NAME)
module.exports=Plan