const constants=require('../constants/constants')
TRIAL_PERIOD=14
ONE_DAY=86400000


function getValidTill(type,startDate){
    validate(type,startDate)
    if(type==constants.TRIAL_PLAN){
        return computeTrialValidTill(startDate)
    }
}

function computeTrialValidTill(startDate){
    return new Date(startDate.getTime()+TRIAL_PERIOD*ONE_DAY)
}

function getSubscriptionObject(type,startDate){
    validate(type, startDate)
    let subscriptionType=type
    let subscriptionStateDate=startDate;
    let subscriptionValidTill=getValidTill(subscriptionType,subscriptionStateDate)
    let subscriptionObject={
        type: subscriptionType,
        start_date: subscriptionStateDate,
        valid_till: subscriptionValidTill
    }
    return subscriptionObject;
}

function validate(type, startDate){
    if(!type || !startDate){
        throw new Error('Invalid Parameter type:'+type+', startDate:'+startDate)
    }
}

module.exports={
    getSubscriptionObject
}
// to do for other plans