//Libraries
const mysql = require('mysql2')
//Middleware
const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();

//Determines if 
async function checkRegStatus (req, res, next) {
    try {
        let curRace = req.body.raceName.split(" ").join("").toLowerCase();
        let queryStatement = `select date, isRegOpen from race_details where lower(replace(name, " ", "")) = "${curRace}"`
        let selectedRace = await connection.query(queryStatement)
        if(!selectedRace[0][0].isRegOpen || new Date(selectedRace[0][0].date) < new Date()) {throw new Error(`Registration is not currently open for the ${req.body.raceName}`)}
        next();
    } catch (error) {
        console.error('Error in checking race registration status:', error)
        res.status(500).json({ "message": "Error in confirming race registration status" + error })
    }
}

module.exports = {checkRegStatus}