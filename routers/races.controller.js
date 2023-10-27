//Libraries
const router = require('express').Router()
const mysql = require('mysql2')
//Middleware
const { authenticateUser } = require("../middleware/authenticate.js")
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
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})

//GET -- Get the categories by raceName -- UNPROTECTED
router.get('/categories/:raceName', async(req, res)=>{
    try {
        const queryStatement = `SELECT raceName, GROUP_CONCAT(category SEPARATOR ", ") as categoryOpts FROM race_categories where lower(replace(raceName, " ", "")) = "${req.params.raceName}";`
        const categories = await connection.query(queryStatement)
        res.status(200).json(categories[0])
    } catch (error) {
        console.error(`There was an error fetching the categories for the selected race ${req.params.raceName}, ${error}`);
        res.status(500).json({ "message": `There was an error fetching the categories data ${error}` })
    }
})


router.get('/:raceName', async (req, res) => {
    const queryStatement = `select * from race_details where lower(replace(name, " ", "")) = "${req.params.raceName}"`;
    try {
        const raceData = await connection.query(queryStatement);
        res.status(200).json(raceData[0])
    } catch (error) {
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})

//needs to account for all different input data - checking typeof for objects
router.patch('/:raceName', authenticateUser, async (req, res) => {
    console.log('patch', req.body)
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        else {
            let fieldUpdateStrings = [];
            for (let propertyName in req.body) {
                console.log(typeof req.body[propertyName])
                if (propertyName !== "name") {
                    if (propertyName === "schedule") {
                        fieldUpdateStrings.push(`${propertyName} = '${JSON.stringify(req.body[propertyName])}'`)
                    }
                    else {
                        fieldUpdateStrings.push(`${propertyName} = "${req.body[propertyName]}"`)
                    }
                }
            }
            const fieldUpdateString = fieldUpdateStrings.join(', ');
            const queryStatement = `update race_details set ${fieldUpdateString} where name = "${req.body.name}" `
            const updatedRace = await connection.query(queryStatement)
            res.status(200).json(updatedRace)
        }
    } catch (error) {
        console.error(`There was an error updating the race ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }

})

module.exports = router;
