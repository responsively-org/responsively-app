const planService=require('../service/plan.service')
const constants=require('../constants/constants')
const paymentConstants=require('../constants/payment.constant')
const https = require('https')
const razorpay=require('../../razorpay/razorpay')

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
        let subscriptionResponse=await razorpay.instance.subscriptions.create(payload)
        return {subscriptionId: subscriptionResponse.id}
        
    }catch(err){
        console.log(err)
        throw err
    }
}

module.exports={
    createSubscription
}