//Libraries
const router = require('express').Router();
const {sendEmail, createReceiptMessage} = require('../utils/emails.js')
//Middleware
const {checkRegStatus} = require('../middleware/registrationCheck.js') 
//DB Connections
const mysql = require('mysql2')
const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();
//PAYPAL Variables
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_BASE_URL } = process.env;
const payeeLookup = {
    testrace: process.env.PAYPAL_TESTRACE_PAYEE,
    newhavenrace: process.env.PAYPAL_NEWHAVENRACE_PAYEE
}

//Get access token for paypal api requests
async function generateAccessToken() {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("Missing API Credentials")
        }
        const auth = Buffer.from(
            PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
        ).toString("base64")
        const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
            method: 'POST',
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`
            }
        });
        const data = await response.json();
        // console.log(`Access token created`, data)
        return data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
    }
}

//Calculate the total charge for paypal checkout
async function calcTotal(orderData) {
    //Get fees and ACA discounts then calculates the total based on the racers and whether or not they have an ACA number
    try {
        const queryStatement = `select fee, acaDiscount from race_details where name = "${orderData.raceName}"`
        const feeResponse = await connection.query(queryStatement)
        const feeInfo = feeResponse[0][0]
        let acaDiscount = Number(feeInfo.acaDiscount);
        let raceFee = Number(feeInfo.fee);
        let subTotal = 0;
        let total = orderData.racers.reduce((accum, racer) => {
            const racerDiscount = racer.acaNumber ? (acaDiscount * -1) : 0;
            const racerTotal = raceFee + racerDiscount;
            accum += racerTotal;
            return accum
        }, subTotal)
        return total
    } catch (error) {
        console.error(`There was an error fetching fees.  ${error}`);
    }
}

//Create paypal order - get an auth token, calculate the total and generate the payload with desired payment account (based on race name), then create the order via paypal api call
async function createOrder(orderData) {
    const token = await generateAccessToken()
    const url = `${PAYPAL_BASE_URL}/v2/checkout/orders`
    const orderValue = await calcTotal(orderData);
    const payeeEmail = payeeLookup[orderData.raceName.split(" ").join("").toLowerCase()]
    const payload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: orderValue.toString()
                },
                payee: {
                    email_address: payeeEmail
                }
            },
        ],
    };
    const createOrderResponse = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
            // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
            // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
        },
        body: JSON.stringify(payload)
    })
    return handleResponse(createOrderResponse)
}


async function captureOrder(orderID) {
    const token = await generateAccessToken();
    const url = `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
            // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
            // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
        }
    })
    return handleResponse(response)
}

async function handleResponse(response) {
    try {
        const jsonResponse = await response.json();
        return {
            jsonResponse,
            httpStatusCode: response.status,
        }
    } catch (error) {
        const errMsg = await response.text();
        console.error(`Error handling the response ${error}`)
        throw new Error(errMsg)
    }
}

async function addRacerEntity(registrationData, transactionID) {
    try {
        const addedDate = new Date();
        const values = [registrationData.year, registrationData.raceName, registrationData.category, transactionID, addedDate];
        let queryStatement = `INSERT INTO racer_entities(year, raceName, category, transactionID, transactionDate) VALUES (?, ?, ?, ?, ?)`
        const addedRacerEntity = await connection.query(queryStatement, values)
        return addedRacerEntity[0].insertId
    } catch (error) {
        console.error(`There was an error adding the racer entity: ${error}`)
    }
}

async function addRacers(registrationData, racerEntityID) {
    try {
        const values = registrationData.racers.map(racer => [racerEntityID, racer.firstName, racer.lastName, racer.birthdate, racer.email, racer.gender, racer.acaNumber, 1])
        const queryStatement = `INSERT INTO racers (racerEntityID, firstName, lastName, birthdate, email, gender, acaNumber, isPaid) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`
        let addedRacers = []
        values.forEach(async row => {
            try {
                let addedRacer = await connection.query(queryStatement, row)
                addedRacers.push(addedRacer[0])
            } catch (error) {
                console.error(`There was an error adding the racer ${row.join(', ')}.  Error ${error}.`);
            }
        })
    } catch (error) {
        console.error(`There was an error adding the racers.  ${error}`)
    }
}

//Create order via paypal API - no info added to DB
router.post("/orders/create", checkRegStatus, async (req, res) => {
    try {
        const orderData = req.body;
        const { jsonResponse, httpStatusCode } = await createOrder(orderData)
        res.status(httpStatusCode).json(jsonResponse)
    } catch (error) {
        console.error(`Error creating order: ${error}`);
        res.status(500).json({ error: `Failed to create order` })
    }
})


//Capture order via paypal API (successful payment) and add racer entity and associated racers to DB
router.post("/orders/capture/:orderID", async (req, res) => {
    try {
        const { orderID } = req.params;
        const { registrationData, date } = req.body;
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
        if (httpStatusCode >= 200 && httpStatusCode < 300) {
            let addedEntityID = await addRacerEntity(registrationData, orderID)
            let addedRacers = await addRacers(registrationData, addedEntityID)
        }
        let timeStamp = new Date();
        const raceName = registrationData.raceName.split(" ").join("").toLowerCase();
        const recipient = registrationData.racers[0].email;
        const messageContent = createReceiptMessage(registrationData.raceName, date, jsonResponse.id, registrationData.racers, jsonResponse.purchase_units[0].payments.captures[0].amount.value)
        await sendEmail(raceName, recipient, "Your race registration receipt", messageContent)
        res.status(httpStatusCode).json({ orderData: jsonResponse, timeStamp: timeStamp })
    } catch (error) {
        console.error(`Failed to capture order: ${error}`)
        res.status(500).json({ error: "Failed to capture order" })
    }
})

module.exports = router;