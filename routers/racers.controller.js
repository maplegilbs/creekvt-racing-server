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


//GET - Get the table format -- PROTECTED
router.get('/tableInfo', authenticateUser, async (req, res) => {
    try {
        const queryStatement = `describe registered_racers`
        const tableStructure = await connection.query(queryStatement)
        res.status(200).json(tableStructure[0])
    } catch (error) {
        console.error(`There was an error fetching the table structure`);
        res.status(500).json({ "message": `There was an error fetching the schedule data ${error}` })
    }
})


//! ADD SEARCH CRITEREA CURRENT RACE YEAR
//GET -- front end route for pages - be sure to only return racer's name, partners and category -- UNPROTECTED
router.get('/:raceName', async (req, res) => {
    try {
        const queryStatement = `select * from registered_racers where lower(replace(raceName," ", "")) = "${req.params.raceName}"`
        let returnedRacers = await connection.query(queryStatement)
        res.status(200).json(returnedRacers)
    }
    catch (error) {
        console.error(`There was an error fetching the race data ${error}`);
        res.status(500).json({ "message": `There was an error fetching the race data ${error}` })
    }
})

//! ADD SEARCH CRITEREA CURRENT RACE YEAR
//GET -- Get racers based on race name -- PROTECTED
router.get('/admin/:raceName', authenticateUser, async (req, res) => {
    try {
        const queryStatement =
            `select registered_racers.*, categoryOpts 
            from registered_racers 
            join ( 
                SELECT raceName, GROUP_CONCAT(category SEPARATOR ', ') as categoryOpts 
                from race_categories where lower(replace(raceName, " ", "")) = "${req.params.raceName}"
            ) as groupedCategories 
            ON 
            registered_racers.raceName = groupedCategories.raceName;`
        // const queryStatement = `select * from registered_racers where lower(replace(raceName," ", "")) = "${req.params.raceName}"`
        let returnedRacers = await connection.query(queryStatement)
        res.status(200).json(returnedRacers[0])
    } catch (error) {
        console.error(`There was an error fetching racer data - provided params racename: ${req.params.raceName}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})

//DELETE - Delete a racer based on the race name and racer id -- PROTECTED
router.delete('/:raceName/:racerId', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        else {
            const queryStatement = `delete from registered_racers where id = ${req.params.racerId}`
            const deletedRacer = await connection.query(queryStatement)
            res.status(200).json(deletedRacer[0])
        }
    } catch (error) {
        console.error(`There was an error deleting the racer - provided params raceName: ${req.params.raceName}, racerId: ${req.params.racerId}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

//PATCH - Update a racer based on the race name and racer id -- PROTECTED
router.patch('/:raceName/:racerId', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        else {
            let updateInfoArray = []
            for (let propertyName in req.body) {
                if (propertyName !== 'partners') {
                    updateInfoArray.push(`${propertyName} = "${req.body[propertyName]}"`)
                }
                else {
                    updateInfoArray.push(`${propertyName} = '${req.body[propertyName]}'`)
                }
            }
            const queryStatement = `update registered_racers set ${updateInfoArray.join(', ')} where id = ${req.params.racerId}`
            const updatedRacer = await connection.query(queryStatement)
            res.status(200).json(updatedRacer[0])
        }
    } catch (error) {
        console.error(`There was an error updating the racer ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
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
                if (typeof req.body[propertyName] === "object") {
                    columnValues.push(JSON.stringify(req.body[propertyName]))
                }
                else { columnValues.push(req.body[propertyName]) }
            }
            const queryStatement = `insert into registered_racers (${columnNames.join(', ')}) values(${columnNames.map(columnName => '?').join(', ')})`
            const insertedRacer = await connection.query(queryStatement, columnValues)
            res.status(200).json(insertedRacer[0])
        }
    } catch (error) {
        console.error(`There was an error updating the race ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

module.exports = router