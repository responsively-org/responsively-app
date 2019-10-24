const Plan=require('../model/plan.model')

async function getPlan(planId){
    console.log('fetching from db - planId:'+planId)
    const plan=await Plan.findOne({_id: planId}).exec()
    console.log('plan:'+plan)
    return plan
}

async function getPlanById(planId){
    console.log('fetching from db - planId:'+planId)
    const plan=await Plan.findOne({_id: planId}).exec()
    console.log('plan:'+plan)
    return plan
}

async function getPlanByNumberOfUsers(quantity){
    console.log('fetching plan for userCount:'+quantity)
    let planList=await Plan.find({user_limit:{"$gte":quantity}}).sort({user_limit:1}).limit(1).exec()

    console.log('plan fetched:'+planList)
    if(planList.length==0){
        planList=await Plan.find().sort({user_limit:1}).limit(1).exec()
        console.log('plan fetched:'+planList)
    }

    if(planList.length==0){
        return {}
    }
    return planList[0]
}

async function checkIfPlanStillValidForDate(startDate, planId){

    let plan=await getPlan(planId)
    return validator(startDate,plan)
    return false
}

function validator(startDate, plan){
    
    console.log('calculating validity of month plan:'+plan+',startTime:'+startDate)
    let endDate=new Date(startDate)
    endDate.setMonth(endDate.getMonth()+1)
    if(endDate.getTime()>=new Date().getTime()){
        return true
    }    
    return false
}

async function getCurrentUserLimitForPlan(startDate,planId){
    let plan=await getPlan(planId)
    let valid=validator(startDate,plan)
    if(valid){
        return plan.user_limit
    }
    return 0
}

module.exports={
    getPlan,
    getPlanById,
    checkIfPlanStillValidForDate,
    getCurrentUserLimitForPlan,
    getPlanByNumberOfUsers
}