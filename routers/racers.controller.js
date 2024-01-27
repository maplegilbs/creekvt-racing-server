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



//GET -- Get the table format for a racer -- PROTECTED
router.get('/admin/tableInfo/:tableName', authenticateUser, async (req, res) => {
    const tableName = req.params.tableName === 'racers' ? 'racers' : 'racer_entities';
    try {
        const queryStatement = `describe ${tableName}`
        const tableStructure = await connection.query(queryStatement)
        res.status(200).json(tableStructure[0])
    } catch (error) {
        console.error(`There was an error fetching the racer_entities table structure.  ${error}`);
        res.status(500).json({ "message": `There was an error fetching the table info data` })
    }
})


//GET -- Get racers based on race name and year.  Joined with racer entity data. -- PROTECTED
router.get('/admin/:raceName/:raceYear', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) res.status(403).json({ "message": "Permission to modify selected race denied" })
        else {
            const queryStatement = `
                SELECT racers.*, racer_entities_details.* 
                FROM racers 
                JOIN (
                    SELECT racer_entities.id as racerEntityID, racer_entities.category, racer_entities.raceName, racer_entities.year, race_details.categoryOptions  
                    FROM racer_entities 
                    JOIN race_details 
                    on racer_entities.raceName = race_details.name
                    ) as racer_entities_details
                ON racer_entities_details.racerEntityID = racers.racerEntityID 
                WHERE 
                racer_entities_details.year = ${Number(req.params.raceYear)}
                AND
                lower(replace(racer_entities_details.raceName, " ", "")) = "${req.params.raceName}"`

            const returnedRacers = await connection.query(queryStatement)
            res.status(200).json(returnedRacers[0])
        }
    } catch (error) {
        console.error(`There was an error fetching racers for admin based on the passed in year: ${req.params.raceYear} and race: ${req.params.raceName}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the data based on the passed in year: ${req.params.raceYear} and race: ${req.params.raceName}.` })
    }
})

//GET -- Get racers based on race name and year.  Joined with racer entity data. Returning only firstname, lastname, id and category.  For front end usage.  -- UNPROTECTED
router.get('/:raceName/:raceYear', async (req, res) => {
    try {
        const queryStatement = `
                SELECT racers.firstName, racers.lastName, racer_entities_details.id as entityID, racer_entities_details.category
                FROM racers 
                JOIN (
                    SELECT racer_entities.*, race_details.categoryOptions 
                    FROM racer_entities 
                    JOIN race_details 
                    on racer_entities.raceName = race_details.name
                    ) as racer_entities_details
                ON racer_entities_details.id = racers.racerEntityID 
                WHERE 
                racer_entities_details.year = ${Number(req.params.raceYear)}
                AND
                lower(replace(racer_entities_details.raceName, " ", "")) = "${req.params.raceName}"
                ORDER BY entityID`

        const returnedRacers = await connection.query(queryStatement)
        res.status(200).json(returnedRacers[0])
    } catch (error) {
        console.error(`There was an error fetching racers based on the passed in year: ${req.params.raceYear} and race: ${req.params.raceName}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the data based on the passed in year: ${req.params.raceYear} and race: ${req.params.raceName}.` })
    }
})

//POST -- Add a new racer entity -- PROTECTED
router.post('/admin/addRaceEntity/:raceName', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) res.status(403).json({ "message": "Permission to modify selected race denied" })
        else {
            let addedDate = new Date();
            let columnNames = ['transactionDate'];
            let columnValues = [addedDate];
            for (let propertyName in req.body) {
                columnNames.push(propertyName)
                columnValues.push(req.body[propertyName])
            }
            const queryStatement = `insert into racer_entities (${columnNames.join(', ')}) values(${columnNames.map(columnName => '?').join(', ')})`
            const insertedRacerEntity = await connection.query(queryStatement, columnValues)
            res.status(200).json(insertedRacerEntity[0])
        }
    } catch (error) {
        console.error(`There was an error adding a new race entity.  ${error}`);
        res.status(500).json({ "message": `There was an error adding a new race entity` })
    }
})

//PATCH - Update a racer entity based on the race name and racer entity id -- PROTECTED
router.patch('/admin/editRacerEntity/:raceName/:racerEntityId', authenticateUser, async (req, res) => {
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
            const queryStatement = `update racer_entities set ${updateInfoArray.join(', ')} where id = ${req.params.racerEntityId}`
            const updatedRacerEntity = await connection.query(queryStatement)
            res.status(200).json(updatedRacerEntity[0])
        }
    } catch (error) {
        console.error(`There was an error updating the racer ${error}`);
        res.status(500).json({ "message": `There was an error updating the data` })
    }
})

//DELETE - Delete a race entity and all racers based on the race entity id -- PROTECTED
router.delete('/admin/deleteRacerEntity/:raceName/:racerEntityId', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        else {
            let queryStatement = `delete from racer_entities where id = ${req.params.racerEntityId}`
            const deletedRacerEntity = await connection.query(queryStatement)
            queryStatement = `delete from racers where racerEntityID = ${req.params.racerEntityId}`
            const deletedRacers = await connection.query(queryStatement)
            res.status(200).json({ deletedRacerEntity: deletedRacerEntity[0], deletedRacers: deletedRacers[0] })
        }
    } catch (error) {
        console.error(`There was an error deleting the racer entity and associated racers - provided params raceName: ${req.params.raceName}, racerId: ${req.params.racerId}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error updating the data.` })
    }
})


//POST -- Add a new racer - based on the race name -- PROTECTED
router.post('/admin/addRacer/:raceName', authenticateUser, async (req, res) => {
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
            const queryStatement = `insert into racers (${columnNames.join(', ')}) values(${columnNames.map(columnName => '?').join(', ')})`
            const insertedRacer = await connection.query(queryStatement, columnValues)
            res.status(200).json(insertedRacer[0])
        }
    } catch (error) {
        console.error(`There was an error adding a new racer ${error}`);
        res.status(500).json({ "message": `There was an error adding a new racer` })
    }
})

//PATCH - Update a racer based on the race name and racer id -- PROTECTED
router.patch('/admin/editRacer/:raceName/:racerId', authenticateUser, async (req, res) => {
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
            const queryStatement = `update racers set ${updateInfoArray.join(', ')} where id = ${req.params.racerId}`
            const updatedRacer = await connection.query(queryStatement)
            res.status(200).json(updatedRacer[0])
        }
    } catch (error) {
        console.error(`There was an error updating the racer ${error}`);
        res.status(500).json({ "message": `There was an error updating the data` })
    }
})

//DELETE - Delete a racer based on the racer racer id -- PROTECTED
router.delete('/admin/deleteRacer/:raceName/:racerId', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        else {
            let queryStatement = `delete from racers where id = ${req.params.racerId}`
            const deletedRacers = await connection.query(queryStatement)
            res.status(200).json(deletedRacers[0])
        }
    } catch (error) {
        console.error(`There was an error deleting the racer - provided params raceName: ${req.params.raceName}, racerId: ${req.params.racerId}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error deleting the racer - provided params raceName: ${req.params.raceName}, racerId: ${req.params.racerId}.` })
    }
})


module.exports = router