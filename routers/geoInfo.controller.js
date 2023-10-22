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

router.get("/:racename", async (req, res) => {
    try {
        const queryStatement = `select * from map_info where lower(replace(raceName, " ", "")) = ${req.params.racename}`;
        const mapData = await connection.query(queryStatement)
        res.status(200).json(mapData)
    } catch (error) {
        console.error(`There was an error fetching racer data - provided params racename: ${req.params.racename}, racerId: ${req.params.racerId}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})

module.exports = router
