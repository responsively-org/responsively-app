var express=require('express')
var db=require('./src/db/db')
var subscriptionRouter=require('./src/app/router/subscription.router')
const app=express()

app.use('/subscription', subscriptionRouter)

const server=app.listen(process.env.SERVER_PORT,function() {});
