//Libraries
const router = require('express').Router()
const mysql = require('mysql2')
//Middleware
const {authenticateUser} = require("../middleware/authenticate.js")
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


router.patch('/:raceName', authenticateUser, async(req, res)=>{
    let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
    if(!modifiedRaces.includes(req.params.raceName)){
        res.status(403).json({"message": "Permission to modify selected race denied"})
    }
    else {
        res.send(modifiedRaces)
    }

})

module.exports = router;
