var db=require('../db/db')
const userService = require('../app/service/user.service')
const activeConnectionService = require('../app/service/active-connections.service')
const subscriptionService = require('../app/service/subscription.service')
const InvalidLicenseError=require('../app/exception/invalid-license-error.exception')
const InvalidSubscriptionError=require('../app/exception/invalid-subscription.exception')

export async function connectionHandler(event, context, callback) {

  let responseBody={}
  const connectionId=event.requestContext.connectionId
  try{
    console.log(event)
    if(event.requestContext.eventType==='CONNECT'){
      const {licenseKey}=event.queryStringParameters
      await activeConnectionService.addNewConnection(licenseKey, connectionId)
      responseBody.status=true
      responseBody.statusCode=200
      responseBody.message='connection established'
    }else if(event.requestContext.eventType==='DISCONNECT'){
      await activeConnectionService.closeConnection(connectionId)
    }
  }catch(err){
    console.log(err)
    responseBody.status=false
      if(err instanceof InvalidSubscriptionError){
        responseBody.statusCode=403
        responseBody.message='invalid subscription'
      }else if(err instanceof InvalidLicenseError){
          responseBody.statusCode=403
          responseBody.message='invalid license'
      }else{
          responseBody.statusCode=500
          responseBody.message='server error'
      }
  }
  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  };
}

export async function defaultHandler(event, context, callback) {
  try{
    const body=JSON.parse(event.body)
    const connectionId=event.requestContext.connectionId

    if(!body.data || !body.data.licenseKey){
      throw new InvalidLicenseError('license Key is empty')
    }
    const licenseKey=body.data.licenseKey
    activeConnectionService.closeConnection(licenseKey, connectionId)
  }catch(err){
    console.log(err)
  }
  return {
    statusCode: 200,
    body: 'Connection closed',
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
  const connectionId=event.requestContext.connectionId
  console.log(event)
  try{
    const body=JSON.parse(event.body)
    if(!body.data || !body.data.licenseKey){
      throw new InvalidLicenseError('licenseKey is empty')
    }
    const licenseKey=body['data']['licenseKey']
    let connectionStatus=await activeConnectionService.checkIfValidConnection(licenseKey,connectionId)
    responseBody.status=connectionStatus
    if(connectionStatus){
      responseBody.statusCode=200
      responseBody.message='valid'
    }else{
      responseBody.statusCode=403
      responseBody.message='not found in active users'
    }
  }catch(err){
    console.log(err)
    if(err instanceof InvalidLicenseError){
      responseBody.status=false
      responseBody.statusCode=403
      responseBody.message='invalid license error'  
    }else{
      responseBody.status=false
      responseBody.statusCode=500
      responseBody.message='internal server error'
    }
  }
  await activeConnectionService.publish(event,connectionId,responseBody)
  let response= {
    statusCode: 200,
    body: JSON.stringify(responseBody)
  }
  callback(null, response)
}