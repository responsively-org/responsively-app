const express = require('express');
const userService = require('../service/user.service')
const UserExistsError=require('../exception/user-exists-error.exception')
const InvalidEmailError=require('../exception/invalid-email-error.exception')
const InvalidLicenseError=require('../exception/invalid-license-error.exception')

const router = express.Router();
router.get('/activate-trial', async function (req, res) {
    const email=req.query.email
    let responseBody={}
    try{
        await userService.createUserAndEnableTrial(email)
        responseBody.status=true
        responseBody.message='success'
    }catch(err){
        console.log(err)
        responseBody.status=false
        if(err instanceof UserExistsError){
            responseBody.errorType=409
            responseBody.message='user already activated'
        }else if(err instanceof InvalidEmailError){
            responseBody.errorType=400
            responseBody.message='invalid email'
        }else{
            responseBody.errorType=500
            responseBody.message='Internal Server Error'
        }
    }
    res.send(responseBody)
})

router.get('/verify-license', async function (req, res) {
    const licenseKey=req.query.licenseKey
    let responseBody={}
    try{
        await userService.verifyLicenseKey(licenseKey)
        responseBody.status=true
        responseBody.message='success'
    }catch(err){
        console.log(err)
        responseBody.status=false
        if(err instanceof InvalidLicenseError){
            responseBody.errorType=403
            responseBody.message='Invalid License'
        }else{
            responseBody.errorType=500
            responseBody.message='Internal Server Error'
        }
    }
    res.send(responseBody)
})

module.exports = router;