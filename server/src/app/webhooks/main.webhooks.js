const subscriptionService=require('../service/subscription.service')
const crypto=require('crypto')
const razorpay=require('../../razorpay/razorpay')

export async function processEvent(eventData){

    data=JSON.parse(eventData.body)
    razorpay.instance.validateWebhookSignature(data,eventData.X-Razorpay-Signature,process.env.RAZOR_PAY_WEBHOOK_SECRET)
    try{
        if(data.entity==='event'){

            if(data.event==='subscription.activated'){
                subscriptionService.processSubscriptionActivatedEvent(data)
            }else if(data.event==='subscription.halted'){
                subscriptionService.processSubscriptionHaltEvent(data)
            }
        }
    }catch(err){
        console.log(err)
        throw err
    }
}