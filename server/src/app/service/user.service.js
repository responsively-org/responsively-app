const User=require('../model/user.model')
const db=require('../../db/db')
const subscriptionUtils=require('../utils/subscription.utils')
const constants=require('../constants/constants')
const crypto=require('crypto')
const emailService=require('../service/email.service')
const InvalidEmailError=require('../exception/invalid-email-error.exception')
const UserExistsError=require('../exception/user-exists-error.exception')
cosnt InvalidLicenseError=require('../exception/invalid-license-error.exception')
async function createUserAndEnableTrial(email){

    if(!emailService.validateEmailExistence(email)){
        throw new InvalidEmailError('Invalid Email:'+email)
    }
    let newUser=new User({
        email: email,
        license_key:getLicenseKey(),
        subscription:subscriptionUtils.getSubscriptionObject(constants.TRIAL_PLAN,new Date()),
    })

    await insertUser(newUser)
    emailService.sendLicenseKeyMail(email,newUser.license_key)
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
    return newUser
}

async function verifyLicenseKey(licenseKey){

    if(!licenseKey){
        throw new InvalidLicenseError('Invalid License :'+licenseKey)
    }
    let user=await User.findOne({license_key: licenseKey}).exec()
    if(!user){
        throw new InvalidLicenseError('Invalid License:'+licenseKey)
    }

    let licenseValid=user.subscription.license_key.getTime()-new Date().getTime()
    if(licenseValid<0){
        return false
    }
    return true
}

function getLicenseKey(email){
    const key=crypto.randomBytes(20).toString('hex');
    return key;
}

module.exports={
    createUserAndEnableTrial
}