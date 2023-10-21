//Libraries
const router = require("express").Router()
const mysql = require("mysql2")
//Middleware
const { authenticateUser } = require('../middleware/authenticate.js')
const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();


//need to protect this route so only admins can get emails
router.get('/:racename', async (req, res) => {
    const queryStatement = `select * from registered_racers where lower(replace(raceName," ", "")) = "${req.params.racename}"`
    let returnedRacers = await connection.query(queryStatement)
    res.status(200).json(returnedRacers)
})

router.delete('/:racename/:racerId', authenticateUser, async (req, res) => {
    try {
        const queryStatement = `delete from registered_racers where id = ${req.params.racerId}`
        const deletedRacer = await connection.query(queryStatement)
        res.status(200).json(deletedRacer[0])
    } catch (error) {
        console.error(`There was an error deleting the racer - provided params racename: ${req.params.racename}, racerId: ${req.params.racerId}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

//need to deal with null values
router.patch('/:raceName/:racerId', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        else{
            let updateInfoArray = []
            for (let propertyName in req.body) {
                console.log(`type: ${typeof req.body[propertyName]}: ${propertyName}`)
                if (propertyName !== 'partners') {
                    updateInfoArray.push(`${propertyName} = "${req.body[propertyName]}"`)
                }
                else {
                    updateInfoArray.push(`${propertyName} = '${req.body[propertyName]}'`)
                }
            }
            console.log(updateInfoArray.join(', '))
            const queryStatement = `update registered_racers set ${updateInfoArray.join(', ')} where id = ${req.params.racerId}`
            const updatedRacer = await connection.query(queryStatement)
            res.status(200).json(updatedRacer[0])
        }
    } catch (error) {
        console.error(`There was an error updating the racer ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

//need to protect this route to make sure payment is submitted first or user is an admin
router.post('/:racename', async (req, res) => {
    try {
        console.log(req.body);
        let columnNames = [];
        let columnValues = [];
        for (let propertyName in req.body) {
            columnNames.push(propertyName)
            if (typeof req.body[propertyName] === "object") {
                columnValues.push(JSON.stringify(req.body[propertyName]))
            }
            else { columnValues.push(req.body[propertyName]) }
        }
        const queryStatement = `insert into registered_racers (${columnNames.join(', ')}) values(${columnNames.map(columnName => '?').join(', ')})`
        const insertedRacer = await connection.query(queryStatement, columnValues)
        res.status(200).json(insertedRacer[0])
    } catch (error) {
        console.error(`There was an error updating the race ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

module.exports = router