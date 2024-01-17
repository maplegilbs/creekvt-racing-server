//Libraries
const nodeMailer = require('nodemailer');
const {formatDateTime} = require('./formatDateTime.js')
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

function createReceiptMessage(raceName, raceDate, transactionID, racers, total) {

    let formattedRaceDate = formatDateTime(new Date(raceDate))
    let racersString = ""
    racers.forEach(racer => {
        let racerString = `&nbsp;&nbsp;${racer.firstName} ${racer.lastName ? racer.lastName : ''} <br/>`
        racersString = racersString + racerString;
    })
    let emailTemplate = `
    ${raceDate? `<h2 style="text-align: center">Clear your calendar for <strong>${formattedRaceDate.dow} ${formattedRaceDate.fullDate}</strong>.</h2>` : ""}
    <h2 style="text-align: center">You have been registered to compete in the ${raceName}</h2>
    <hr style='width: 70%; margin: 0 auto;'/>
    <div style="width:70%; margin: 10px auto;">
      <h3>Registration Details</h3>
      <p><strong>Transaction ID:</strong> <br/>&nbsp;&nbsp;${transactionID}</p>
      <p><strong>Total:</strong> <br/>&nbsp;&nbsp;${total}</p>
      <p><strong>Category:</strong> <br/>&nbsp;&nbsp;Creek Boat</p>
      <p><strong>Racers:</strong> <br/>${racersString}</p>
    </div>
    <hr style='width: 70%; margin: 0 auto;'/>
    <p style='width: 70%; margin: 10px auto;'>**As the race approaches be sure to check <a href="https://creekvt.com/races/${raceName.split(" ").join("").toLowerCase()}">the race page</a> for any updates should the race need to be moved to a fallback date.**</p>
    <p style='width: 70%; margin: 10px auto;'>Questions?  Reply to this email</p>
    <p style="display: flex; align-items: center; width: 70%; margin: 0 auto;">
    See You On The River!<img src="https://creekvt.com/races/RacerIcon.png" height=26px/>
    </p>
    `
    return emailTemplate
}

//Async function used to send email
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
}

module.exports = { sendEmail, createReceiptMessage }
