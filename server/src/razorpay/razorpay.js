const Razorpay=require('razorpay')

export const instance = new Razorpay({
    key_id: process.env.RAZOR_PAY_API_KEY,
    key_secret: process.env.RAZOR_API_SECRET_KEY
})