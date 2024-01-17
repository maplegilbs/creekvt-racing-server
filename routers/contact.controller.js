//Libraries
const router = require('express').Router();
const nodeMailer = require('nodemailer')
const {captchaCheck} = require('../middleware/captchaCheck.js')
const {sendEmail} = require('../utils/emails.js')


//General Contact Message sending to message from contact form via email to email address associated with race 
router.post('/', captchaCheck, async (req, res) => {
    try {
        const {email, raceName, message, name} = req.body
        // console.log(email, raceName, message, name)
        const subject = `Contact from ${name}`;
        const messageContent = `<p>From ${email}  ${raceName? '-- Regarding the ' + raceName: ""}</p><br/><p>${message}</p>`
        const recipient = raceName ? emailLookup.user[raceName.split(" ").join("").toLowerCase()] : 'gopaddling@creekvt.com';
        const info = await sendEmail("general", recipient, subject, messageContent)
        console.log(`Message sent id: ${info.messageId}`)
        res.status(200).json(info)
    } catch (error) {
        res.status(500).json({message: `There was an error sending the message.  Please try contacting us via email.`})
        console.error(`Error sending email: ${error}`)
    }
})



module.exports = router