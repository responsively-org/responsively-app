const subscriptionService=require('../service/subscription.service')
const crypto=require('crypto')
const Razorpay=require('razorpay')
const mongoose=require('mongoose')

export async function processEvent(eventData){

    const data=JSON.parse(eventData.body)
    const signatureValid=Razorpay.validateWebhookSignature(eventData.body,eventData.headers["X-Razorpay-Signature"],process.env.RAZOR_PAY_WEBHOOK_SECRET)
    if(!signatureValid){
        console.log('invalid request:signature does not match');
        return
    }
    try{
        let eventData={
            event_data: data,
            c_ts: new Date()
        }

        console.log('inserting webhook event in db')
        await mongoose.connection.collection('webhook_events').insert(eventData)
        if(data.entity==='event'){
            if(data.event==='subscription.activated' || data.event==='subscription.charged'){
                await subscriptionService.processSubscriptionActivatedEvent(data)
            }
        }
    }catch(err){
        console.log(err)
        throw err
    }
}