const TRIAL_PLAN='TRIAL'

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
    TRIAL_PLAN: TRIAL_PLAN,
    SUBSCRIPTION_STATUS: SUBSCRIPTION_STATUS
}