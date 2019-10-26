const sgMail = require('@sendgrid/mail');
const emailUtils=require('../utils/email.utils')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SYSTEM_MAIL='noreply@responsively.app'
async function sendMail(email,subject,content){
    if(process.env.SEND_MAIL==='false'){
        return
    }
    console.log('sending mail to email:'+email+', subject:'+subject)
    const msg = {
        to: email,
        from: SYSTEM_MAIL,
        subject: subject,
        html: content,
      };
      await sgMail.send(msg);
}

function validateEmailExistence(email){

    return emailUtils.validateEmail(email)
    /**
     * to do check email existence, mx lookup. figure out 10min email workarounds
     */
}

module.exports={
    sendMail,
    validateEmailExistence
}