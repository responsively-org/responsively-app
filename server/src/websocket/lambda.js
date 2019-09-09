var db=require('../db/db')
const userService = require('../app/service/user.service')
const InvalidLicenseError=require('../app/exception/invalid-license-error.exception')

export async function connectionHandler(event, context, callback) {
  return {
    statusCode: 200,
    body: 'Message recieved',
  };
}

export async function defaultHandler(event, context, callback) {
  return {
    statusCode: 200,
    body: 'Message recieved',
  };
}

export async function pingHandler(event, context, callback) {
  return {
    statusCode: 200,
    body: 'Message recieved',
  };
}

export async function validateLicense(event, context, callback) {
  let responseBody={}
  let statusCode=0
  context.callbackWaitsForEmptyEventLoop = false;
  console.log(event)
  try{
    const body=JSON.parse(event.body)
    if(!body['data'] || !body['data']['licenseKey']){
      throw new InvalidLicenseError('licenseKey is empty')
    }
    const licenseKey=body['data']['licenseKey']
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