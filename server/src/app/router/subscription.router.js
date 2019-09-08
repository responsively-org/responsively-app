const express = require('express');
const userService = require('../service/user.service')
const UserExistsError=require('../exception/user-exists-error.exception')
const InvalidEmailError=require('../exception/invalid-email-error.exception')

const router = express.Router();
router.get('/activate-trial', async function (req, res) {
    const email=req.query.email
    let responseBody={}
    try{
        await userService.createUserAndEnableTrial(email)
        console.log('bbb')
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

module.exports = router;