const TRIAL_PLAN_ID='TRIAL'

const SUBSCRIPTION_STATUS=Object.freeze({
    ACTIVE:{
        id: 'ACTIVE'
    },
    EXPIRED:{
        id:'EXPIRED'
    }
})

const SUBSCRIPTION_DURATION=Object.freeze({
    MONTH:{
        id: 'ACTIVE'
    },
    YEAR:{
        id:'EXPIRED'
    }
})

module.exports={
    TRIAL_PLAN_ID: TRIAL_PLAN_ID,
    SUBSCRIPTION_STATUS: SUBSCRIPTION_STATUS
}