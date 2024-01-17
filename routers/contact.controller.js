//Libraries
const router = require('express').Router();
const {captchaCheck} = require('../middleware/captchaCheck.js')
const {sendEmail} = require('../utils/emails.js')
//Email Variables
const { NEWHAVEN_SENDER_USER, NEWHAVEN_SENDER_PASS } = process.env
const { PEAVINE_SENDER_USER, PEAVINE_SENDER_PASS } = process.env
const { CREEKVT_SENDER_USER, CREEKVT_SENDER_PASS } = process.env
const emailLookup = {
    senderName: {
        newhavenrace: "New Haven Ledges Race",
        peavinerace: "Peavine Race",
        general: "CreekVT Races Contact"
    },
    user: {
        newhavenrace: NEWHAVEN_SENDER_USER,
        peavinerace: PEAVINE_SENDER_USER,
        general: CREEKVT_SENDER_USER
    },
    pass: {
        newhavenrace: NEWHAVEN_SENDER_PASS,
        peavinerace: PEAVINE_SENDER_PASS,
        general: CREEKVT_SENDER_PASS
    }
}

//General Contact Message sending to message from contact form via email to email address associated with race 
router.post('/', captchaCheck, async (req, res) => {
    try {
        const {email, raceName, message, name} = req.body
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