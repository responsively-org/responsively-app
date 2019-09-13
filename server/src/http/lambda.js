const db=require('../db/db')
const userService = require('../app/service/user.service')
const UserExistsError=require('../app/exception/user-exists-error.exception')
const InvalidLicenseError=require('../app/exception/invalid-license-error.exception')
const InvalidEmailError=require('../app/exception/invalid-email-error.exception')

export async function activateTrial(event, context, callback) {
  let responseBody={}
  let statusCode=0
  context.callbackWaitsForEmptyEventLoop = false;
  try{
      const email=event['queryStringParameters']['email']
      if(!email){
        throw new InvalidEmailError('email is empty')
      }
      await userService.createUserAndEnableTrial(email)
      responseBody.status=true
      responseBody.statusCode=200;
      responseBody.message='success'
      statusCode=200
  }catch(err){
      console.log(err)
      responseBody.status=false
      if(err instanceof UserExistsError){
          responseBody.statusCode=409
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

export async function validateLicense(event, context, callback) {
  let responseBody={}
  let statusCode=0
  context.callbackWaitsForEmptyEventLoop = false;
  try{
      const licenseKey=event['queryStringParameters']['licenseKey']
      if(!licenseKey){
        throw new InvalidLicenseError('licenseKey is empty')
      }
      responseBody.status=await userService.validateLicenseKey(licenseKey)
      responseBody.statusCode=200
      if(responseBody.status){
        responseBody.message='success'
      }else{
        responseBody.message='license expired'
      }
      statusCode=200
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
    let response= {
      statusCode: 200,
      body: JSON.stringify(responseBody)
    }
    callback(null, response)
  }