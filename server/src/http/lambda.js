const db=require('../db/db')
const subscriptionService = require('../app/service/subscription.service')
const paymentsService=require('../app/service/payment.service')
const UserExistsError=require('../app/exception/user-exists-error.exception')
const PlanNotFoundError=require('../app/exception/plan-not-found-error.exception')
const InvalidLicenseError=require('../app/exception/invalid-license-error.exception')
const InvalidEmailError=require('../app/exception/invalid-email-error.exception')

export async function activateTrial(event, context, callback) {
  let responseBody={}
  let statusCode=0
  context.callbackWaitsForEmptyEventLoop = false;
  try{
      const {email}=event.queryStringParameters
      if(!email){
        throw new InvalidEmailError('email is empty')
      }
      await subscriptionService.createUserAndActivateTrial(email)
      responseBody.status=true
      responseBody.statusCode=200;
      responseBody.message='success'
      statusCode=200
  }catch(err){
      console.log(err)
      responseBody.status=false
      if(err instanceof PlanNotFoundError){
          responseBody.statusCode=400
          responseBody.message='user already activated'
      }else if(err instanceof InvalidEmailError){
          responseBody.statusCode=400
          responseBody.message='invalid email'
      }else{
          responseBody.statusCode=500
          responseBody.message='Internal Server Error'
      }
  }
  let response= {
    statusCode: 200,
    body: JSON.stringify(responseBody)
  }
  callback(null, response)
}

export async function createSubscription(event, context, callback) {
  let responseBody={}
  let statusCode=0
  context.callbackWaitsForEmptyEventLoop = false;
  console.log(event)
  try{

    const reqBody=JSON.parse(event.body)
    const quantity=reqBody.quantity

    responseBody=await paymentsService.createSubscription(quantity)
    responseBody.status=true
    responseBody.statusCode=200;
    responseBody.message='success'
    statusCode=200
  }catch(err){
      console.log(err)
      responseBody.status=false
      if(err instanceof UserExistsError){
          responseBody.statusCode=400
          responseBody.message='no matching plan found'
      }else{
          responseBody.statusCode=500
          responseBody.message='Internal Server Error'
      }
  }
  let response= {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : '*',
      "Access-Control-Allow-Credentials" : true
  }
    body: JSON.stringify(responseBody)
  }
  callback(null, response)
}

export async function validateLicense(event, context, callback) {
  let responseBody={}
  let statusCode=0
  context.callbackWaitsForEmptyEventLoop = false;
  try{
    const {licenseKey}=event.queryStringParameters
    responseBody=await subscriptionService.constructLicenseValidationResponse(licenseKey)
  }catch(err){
    console.log(err)
  }
  let response= {
    statusCode: 200,
    body: JSON.stringify(responseBody)
  }
  callback(null, response)
  }