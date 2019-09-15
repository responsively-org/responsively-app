const User=require('../model/user.model')
const Subscription=require('../model/subscription.model')
const userService=require('../service/user.service')
const planService=require('../service/plan.service')
const constants=require('../constants/constants')
const emailService=require('../service/email.service')
const InvalidLicenseError=require('../exception/invalid-license-error.exception')
const UserExistsError=require('../exception/user-exists-error.exception')
const mongoose=require('mongoose')

async function createUserAndActivateTrial(email){

    try{
        let trialPlan=await planService.getPlanByName(constants.TRIAL_PLAN)

        if(await userService.checkIfUserExists(email)){
            throw new UserExistsError('User exists')
        }
        let user=await userService.createUser(email)
    
        let subscription=new Subscription({
            user_id: user._id,
            plan_id: trialPlan._id,
            start_date: new Date(),
            status: constants.SUBSCRIPTION_STATUS.ACTIVE.id,
        })
        await insertSubscription(subscription)
        await emailService.sendLicenseKeyMail(email,user.license_key)
    }catch(err){
        console.log(err)
        throw err
    }
}

async function insertSubscription(subscription){

    subscription.c_ts=new Date()
    subscription.u_ts=new Date()
    try{
        await subscription.save()
    }catch(err){
        console.log('error saving subscription'+subscription);
        throw err
    }
}

async function getSubscriptionByLicenseKey(licenseKey){
    try{
        if(!licenseKey){
            throw new InvalidLicenseError('Invalid License :'+licenseKey)
        }
        let user=await User.findOne({license_key: licenseKey}).exec()
        if(!user){
            throw new InvalidLicenseError('Invalid License:'+licenseKey)
        }
        let subscription= await Subscription.findOne({user_id: user._id,status: constants.SUBSCRIPTION_STATUS.ACTIVE.id}).exec()
        return subscription
    }catch(err){
        console.log(err)
        throw err
    }
}

async function validateLicenseKey(licenseKey){

    try{
        let subscription= await getSubscriptionByLicenseKey(licenseKey)
        let licenseValid=await planService.checkIfPlanStillValidForDate(subscription.start_date,subscription.plan_id)
        if(licenseValid){
            console.log('license active!');
            return true
        }
        console.log('license expired!');
        return false
    }catch(err){
        console.log(err)
        throw err
    }
}

async function constructLicenseValidationResponse(licenseKey){
    let responseBody={}
    try{
        if(!licenseKey){
            throw new InvalidLicenseError('licenseKey is empty')
        }
        responseBody.status=await validateLicenseKey(licenseKey)
        if(responseBody.status){
            responseBody.statusCode=200
            responseBody.message='success'
        }else{
            responseBody.statusCode=403
            responseBody.message='license expired'
        }
    }catch(err){
        console.log(err)
        responseBody.status=false
        if(err instanceof InvalidLicenseError){
            responseBody.statusCode=403
            responseBody.message='Invalid License'
        }else{
            responseBody.statusCode=500
            responseBody.message='Internal Server Error'
        }
    }
    return responseBody
}

module.exports={
    createUserAndActivateTrial,
    validateLicenseKey,
    constructLicenseValidationResponse,
    getSubscriptionByLicenseKey
}