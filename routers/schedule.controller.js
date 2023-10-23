//Libraries
const router = require('express').Router();
const mysql = require('mysql2')
//Middleware
const { authenticateUser } = require('../middleware/authenticate.js')
//DB Connection
const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();


//Get a schedule based on the racename -- UNPROTECTED
router.get("/:raceName", async (req, res) => {
try {
    const queryStatement = `select * from race_schedule where lower(replace(raceName(" ", "")) = ${req.params.raceName})`
    const fetchedRaceData = await connection.query(queryStatement)
    res.status(200).json(fetchedRaceData[0])
} catch (error) {
    console.error(`There was an error fetching the schedule data ${error} - params: ${req.params.raceName}`);
    res.status(500).json({ "message": `There was an error fetching the schedule data ${error}` })
}
})
//Add a schedule item to a race - based on the race name -- PROTECTED
//Update a schedule item based on the race name and schedule item id -- PROTECTED
//Delete a schedule item based on the race name and schedule item id -- PROTECTED

module.exports = router