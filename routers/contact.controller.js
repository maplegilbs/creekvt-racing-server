//Libraries
const router = require('express').Router();
const nodeMailer = require('nodemailer')
const {captchaCheck} = require('../middleware/captchaCheck.js')


const tempEmailBody = `<p>Another test</p>`
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

async function sendEmail(sender, recipient, subject, messageContent) {
    const transporter = nodeMailer.createTransport({
        host: 'mail.creekvt.com',
        port: 465,
        secure: true,
        auth: {
            user: `${emailLookup.user[sender]}`,
            pass: `${emailLookup.pass[sender]}`
        }
    })

    const info = await transporter.sendMail({
        from: {
            name: `${emailLookup.senderName[sender]}`,
            address: `${emailLookup.user[sender]}`,
        },
        to: `${recipient}`,
        subject: subject,
        html: messageContent
    })
    return info

    //Use to test front end form submission
    // let response = new Promise(resolve => setTimeout(
    //    () => resolve({messageId: 'test'})
    // , 3000))
    // await response
    // return response
    
}

//General Contact Message
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