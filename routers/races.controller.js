const router = require('express').Router()
const mysql = require('mysql2')

const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();

router.get('/', async (req, res) => {
    const queryStatement = `select * from race_details`;
    try {
        const racesData = await connection.query(queryStatement)
        res.status(200).json(racesData[0])
    } catch (error) {
        res.status(500).json({"message": `There was an error fetching the data ${error}`})
    }
})



router.get('/:raceName', async (req, res) => {  
    const queryStatement = `select * from race_details where lower(replace(name, " ", "")) = "${req.params.raceName}"`;
    try {
        const raceData = await connection.query(queryStatement);
        res.status(200).json(raceData[0])
    } catch (error) {
        res.status(500).json({"message": `There was an error fetching the data ${error}`})
    }
})

module.exports = router;
