const planService=require('../service/plan.service')
const constants=require('../constants/constants')
const paymentConstants=require('../constants/payment.constant')
const https = require('https')
const Razorpay=require('razorpay')

var razorPayInstance = new Razorpay({
    key_id: process.env.RAZOR_PAY_API_KEY,
    key_secret: process.env.RAZOR_API_SECRET_KEY
  })

async function createSubscription(quantity){

    try{
        let applicablePlan=await planService.getPlanByNumberOfUsers(quantity)

        console.log(applicablePlan)
        const payload={
            plan_id: applicablePlan._id,
            quantity: quantity,
            total_count: paymentConstants.SUBSCRIPTION_DURATION_MONTHS
        }
        console.log(payload)
        let subscriptionResponse=await razorPayInstance.subscriptions.create(payload)
        return {subscriptionId: subscriptionResponse.id}
        
    }catch(err){
        console.log(err)
        throw err
    }
}

module.exports={
    createSubscription
}