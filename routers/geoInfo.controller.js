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
        const queryStatement = `describe map_info`
        const tableStructure = await connection.query(queryStatement)
        res.status(200).json(tableStructure[0])
    } catch (error) {
        console.error(`There was an error fetching the map_info table structure`);
        res.status(500).json({ "message": `There was an error fetching the schedule data ${error}` })
    }
})


//GET -- Get distinct location names based on the racename -- UNPROTECTED

router.get("/locationNames/:raceName", async(req, res)=>{
    try {
        const queryStatement = `select distinct name from map_info where lower(replace(raceName, " ", "")) = "${req.params.raceName}"`
        const returnedLocaitonNames = await connection.query(queryStatement)
        res.status(200).json(returnedLocaitonNames[0])
    } catch (error) {
        console.error(`There was an error fetching locations data provided params racename: ${req.params.raceName}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the location names for the race: ${req.params.raceName}` })

    }
})
//GET -- Get map options settings based on the racename -- UNPROTECTED
router.get("/mapOptions/:raceName", async (req, res) => {
    try {
        const queryStatement = `select * from map_options where lower(replace(raceName, " ", "")) = "${req.params.raceName}"`;
        const returnedMapOptions = await connection.query(queryStatement)
        res.status(200).json(returnedMapOptions[0])
    } catch (error) {
        console.error(`There was an error fetching map options data - provided params racename: ${req.params.raceName}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})

//GET -- Get locations based on the racename -- UNPROTECTED
router.get("/:raceName", async (req, res) => {
    try {
        const queryStatement = `select * from map_info where lower(replace(raceName, " ", "")) = "${req.params.raceName}"`;
        const returnedMapData = await connection.query(queryStatement)
        res.status(200).json(returnedMapData[0])
    } catch (error) {
        console.error(`There was an error fetching locations data - provided params racename: ${req.params.raceName}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})

//POST - Add a location item to a race - based on the race name -- PROTECTED
router.post("/:raceName", authenticateUser, async (req, res) => {
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
            const queryStatement = `insert into map_info (${columnNames.join(', ')}) values(${columnNames.map(columnName => '?').join(', ')})`;
            const addedMapData = await connection.query(queryStatement, columnValues)
            res.status(200).json(addedMapData[0])
        }
    } catch (error) {
        console.error(`There was an error posting location data - provided params racename: ${req.params.raceName}.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})



router.delete("/:raceName/:locationId", authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        else {
            const queryStatement = `delete from map_info where id = ${req.params.locationId}`
            const deletedLocation = await connection.query(queryStatement)
            res.status(200).json(deletedLocation[0])
        }
    } catch (error) {
        console.error(`There was an error deleting the location ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

//! NEED TO DEAL WITH NULL VALUES? & WITH UNESCAPED CHARACTERS
//PATCH - Update a location item based on the race name and location item id -- PROTECTED
router.patch('/:raceName/:locationId', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        else {
            let updateInfoArray = []
            for (let propertyName in req.body) {
                console.log(`type: ${typeof req.body[propertyName]}: ${propertyName}`)
                updateInfoArray.push(`${propertyName} = "${req.body[propertyName]}"`)
            }
            console.log(updateInfoArray.join(', '))
            const queryStatement = `update map_info set ${updateInfoArray.join(', ')} where id = ${req.params.locationId}`
            console.log(queryStatement)
            const updatedLocation = await connection.query(queryStatement)
            res.status(200).json(updatedLocation[0])
        }
    } catch (error) {
        console.error(`There was an error updating the location ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

module.exports = router
