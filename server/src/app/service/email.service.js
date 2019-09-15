const sgMail = require('@sendgrid/mail');
const emailUtils=require('../utils/email.utils')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SYSTEM_MAIL='noreply@responsively.app'
async function sendLicenseKeyMail(email,licenseKey){
    if(process.env.SEND_MAIL==='false'){
        return
    }
    console.log('sending license key to email:'+email)
    const msg = {
        to: email,
        from: SYSTEM_MAIL,
        subject: 'Responsively - License Key',
        html: 'Please find your license key - <strong>'+licenseKey+'</strong>',
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
    sendLicenseKeyMail,
    validateEmailExistence
}