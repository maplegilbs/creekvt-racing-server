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

//GET - Get the table format -- PROTECTED
router.get('/tableInfo', authenticateUser, async (req, res) => {
    try {
        const queryStatement = `describe race_schedule`
        const tableStructure = await connection.query(queryStatement)
        res.status(200).json(tableStructure[0])
    } catch (error) {
        console.error(`There was an error fetching the schedule table structure`);
        res.status(500).json({ "message": `There was an error fetching the schedule data ${error}` })
    }
})

//GET - Get a schedule based on the racename -- UNPROTECTED
router.get("/:raceName", async (req, res) => {
    try {
        const queryStatement = `select * from race_schedule where lower(replace(raceName, " ", "")) = "${req.params.raceName}"`
        const returnedScheduleData = await connection.query(queryStatement)
        res.status(200).json(returnedScheduleData[0])
    } catch (error) {
        console.error(`There was an error fetching the schedule data ${error} - params: ${req.params.raceName}`);
        res.status(500).json({ "message": `There was an error fetching the schedule data ${error}` })
    }
})

//POST - Add a schedule item to a race - based on the race name -- PROTECTED
router.post('/:raceName', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) res.status(403).json({ "message": "Permission to modify selected race denied" })
        else {
            let columnNames = [];
            let columnValues = [];
            for (let propertyName in req.body) {
                columnNames.push(propertyName)
                columnValues.push(req.body[propertyName])
            }
            const queryStatement = `insert into race_schedule (${columnNames.join(', ')}) values(${columnNames.map(columnName => '?').join(', ')})`
            const insertedScheduleItem = await connection.query(queryStatement, columnValues)
            res.status(200).json(insertedScheduleItem[0])
        }
    } catch (error) {
        console.error(`There was an error updating the schedule data based on passed in race name ${req.params.raceName} ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

//PATCH - Update a schedule item based on the race name and schedule item id -- PROTECTED
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
            const queryStatement = `update race_schedule set ${updateInfoArray.join(', ')} where id = ${req.params.itemID}`
            const updatedItem = await connection.query(queryStatement)
            res.status(200).json(updatedItem[0])
        }
    } catch (error) {
        console.error(`There was an error updating the schedule item ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

//DELETE - Delete a schedule item based on the race name and schedule item id -- PROTECTED
router.delete("/:raceName/:itemID", authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) res.status(403).json({ "message": "Permission to modify selected race denied" })
        else {
            const queryStatement = `delete from race_schedule where id = ${req.params.itemID}`
            const deletedItem = await connection.query(queryStatement)
            res.status(200).json(deletedItem[0])
        }
    } catch (error) {
        console.error(`There was an error deleting the schedule item ${error}`);
        res.status(500).json({ "message": `There was an error deleting the item ${error}` })
    }
})

module.exports = router