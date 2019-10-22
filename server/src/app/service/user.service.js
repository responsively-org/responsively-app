const User=require('../model/user.model')
const Plan=require('../model/plan.model')
const planService=require('../service/plan.service')
const constants=require('../constants/constants')
const crypto=require('crypto')
const emailService=require('../service/email.service')
const InvalidEmailError=require('../exception/invalid-email-error.exception')
const UserExistsError=require('../exception/user-exists-error.exception')
const axios=require('axios')
const Razorpay=require('razorpay')

async function createUser(email, razorPayCustomerId){

    if(!emailService.validateEmailExistence(email)){
        throw new InvalidEmailError('Invalid Email:'+email)
    }
    let newUser=new User({
        email: email,
        license_key:getLicenseKey()
    })

    if(razorPayCustomerId){
        newUser.razorpay_id=razorPayCustomerId
    }

    await insertUser(newUser)
    return newUser
}

async function insertUser(newUser){
    newUser.c_ts=new Date()
    newUser.u_ts=new Date()
    try{
        await newUser.save()
    }catch(err){
        console.log(err)
        if(err.name === 'MongoError' && err.code === 11000){
            throw new UserExistsError('user already exists with email:'+newUser.email)
        }
        throw err
    }
    console.log('userInserted')
    return newUser
}

async function getUserByEmail(email){

    return await User.findOne({email: email})
}

async function getUserByRazorpayId(id){

    return await User.findOne({razorpay_id: id})
}

async function checkIfUserExists(email){

    let user=await getUserByEmail(email)
    console.log(user)
    if(user){
        return true
    }
    return false
}

async function getUserFromRazorPay(customerId){

    let user=await Razorpay.customers.fetch(customerId)
    console.log(user)
    return user
}

function getLicenseKey(email){
    const key=crypto.randomBytes(20).toString('hex');
    return key;
}

module.exports={
    createUser,
    getUserByEmail,
    checkIfUserExists,
    getUserByRazorpayId,
    getUserFromRazorPay
}