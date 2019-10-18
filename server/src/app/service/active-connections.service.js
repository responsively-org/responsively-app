const ActiveConnection=require('../model/active-connections.model')
const subscriptionService=require('../service/subscription.service')
const planService=require('../service/plan.service')
const InvalidSubscriptionError=require('../exception/invalid-subscription.exception')
const InvalidLicenseError=require('../exception/invalid-license-error.exception')
const AWS=require('aws-sdk')

async function addNewConnection(licenseKey,connectionId){

    let responseBody={}
    try{
        let subscription=await subscriptionService.getSubscriptionByLicenseKey(licenseKey)
        if(!subscription){
            throw new Error('no active subscriptions found')
        }
        const allowedUsers=await planService.getCurrentUserLimitForPlan(subscription.start_date,subscription.plan_id)
        if(allowedUsers && allowedUsers>0){        
            const connectionObj={
                connection_id: connectionId,
                start_time: new Date()
            }
            const updateObj={
                $push:{connections:connectionObj},
                $set:{u_ts:new Date()},
                $setOnInsert:{c_ts: new Date()}
            }
            let existingConnection=await ActiveConnection.findOneAndUpdate({_id: licenseKey},updateObj,{upsert:true})
            await removeOldConnection(allowedUsers,existingConnection)

        }else{
            throw new InvalidSubscriptionError('0 user limit found for plan')
        }
    }catch(err){
        console.log(err)
        throw err
    }
}

async function removeOldConnection(userLimit,existingConnection){
    if(existingConnection && existingConnection.connections){
        let connections=existingConnection.connections
        if(connections.length>=userLimit){
            await ActiveConnection.updateOne({_id:existingConnection._id},{$pop:{connections: -1},$set:{u_ts:new Date()}})
        }
    }
}

async function closeConnection(connectionId){
    console.log('disconnecting:'+connectionId)
    await ActiveConnection.updateOne({'connections.connection_id': connectionId},{$pull:{connections:{connection_id:connectionId}}})
    console.log('disconnecting:'+connectionId+' done')
}

async function checkIfValidConnection(licenseKey,connectionId){

    let connection=await ActiveConnection.findOne({_id: licenseKey, 'connections.connection_id':connectionId}).exec()
    if(connection){
        return true
    }
    return false
}

async function publish(event,connectionId,data){
    console.log('publishing data to client connection:'+connectionId+',data:'+JSON.stringify(data))
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    });
    await apigwManagementApi.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(data)
    }).promise()
    console.log('publishing data to client connection:'+connectionId+',data:'+data+' ..done')
}

module.exports={
    addNewConnection,
    closeConnection,
    publish,
    checkIfValidConnection
}
// addNewConnection("asd","aasd").then(res=>{
//     console.log('done')
// })