const mongoose = require('mongoose')
let Schema=mongoose.Schema

const connectionsSchema=new Schema({
    connection_id: {type: String},
    start_time: Date
},{_id: false})

const activeConnectionsSchema=new Schema({
    _id: {type: String},
    connections:[connectionsSchema],
    c_ts: Date,
    u_ts: Date
})

const ACTIVE_CONNECTIONS_MODEL_NAME='ActiveConnection'
const COLLECTION_NAME='active_connections'
const ActiveConnection=mongoose.model(ACTIVE_CONNECTIONS_MODEL_NAME,activeConnectionsSchema,COLLECTION_NAME)
module.exports=ActiveConnection