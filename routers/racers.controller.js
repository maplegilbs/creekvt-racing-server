//Libraries
const router = require("express").Router()
const mysql = require("mysql2")
//Middleware
const {autheticateUser} = require('../middleware/authenticate.js')
const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();

router.get('/:racename', async (req, res)=>{
    res.status(200).json({racers: "racers"})
})

//need to protect this route to make sure payment is submitted first
router.post('/:racename', async (req, res) => {
    try {
        console.log(req.body);
        const values = [req.body.year, req.body.raceName, req.body.firstName, req.body.lastName, req.body.email]
        const queryStatement = `insert into registered_racers (year, raceName, firstName, lastName, email) values(?,?,?,?,?)`
        const insertedRacer = connection.query(queryStatement, values)
        console.log(queryStatement);
        res.status(200).json(insertedRacer)
    } catch (error) {
        console.error(`There was an error updating the race ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

module.exports = router