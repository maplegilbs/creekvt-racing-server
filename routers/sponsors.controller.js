//Libraries
const router = require('express').Router();
const mysql = require('mysql2')
//Middleware
const { authenticateUser } = require('../middleware/authenticate')
//DB Connection
const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise()

//GET - Get sponsors based on the racename -- UNPROTECTED
router.get("/:raceName", async (req, res) => {
    try {
        const queryStatement = `select * from sponsors where lower(replace(raceName, " ", "")) = "${req.params.raceName}"`
        const returnedSponsorsData = await connection.query(queryStatement)
        res.status(200).json(returnedSponsorsData[0])
    } catch (error) {
        console.error(`There was an error fetching the sponsors data ${error} - params: ${req.params.raceName}`);
        res.status(500).json({ "message": `There was an error fetching the sponsors data ${error}` })
    }
})

//PATCH - Update a sponsor based on the race name and sponsor id -- PROTECTED
router.patch('/:raceName/:itemID', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        else {
            let updateInfoArray = []
            for (let propertyName in req.body) {
                updateInfoArray.push(`${propertyName} = '${req.body[propertyName]}'`)
            }
            console.log(updateInfoArray)
            const queryStatement = `update sponsors set ${updateInfoArray.join(', ')} where id = ${req.params.itemID}`
            const updatedItem = await connection.query(queryStatement)
            res.status(200).json(updatedItem[0])
        }
    } catch (error) {
        console.error(`There was an error updating the item ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

module.exports = router;