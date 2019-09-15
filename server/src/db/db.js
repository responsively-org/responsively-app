const mongoose = require('mongoose');
const MONGO_USERNAME = process.env.MONGO_USERNAME
const MONGO_PASSWORD = process.env.MONGO_PASSWORD
const MONGO_HOSTNAME = process.env.MONGO_HOSTNAME
const MONGO_PORT = process.env.MONGO_PORT
const MONGO_DB = process.env.MONGO_DB
const url = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}/${MONGO_DB}`
console.log('connecting to db');
mongoose.connect(url,{ useNewUrlParser: true }, function(error){
    if(error){console.log(error)}
    else{console.log("connection successful")}
})
