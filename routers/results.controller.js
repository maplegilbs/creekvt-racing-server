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


//GET - get the table format -- PROTECTED

//GET - get all results
router.get('/', async (req, res)=>{
    try {
        const queryStatement = `SELECT * FROM results ORDER BY year desc, raceName asc, place asc`
        const returnedResults = await connection.query(queryStatement)
        res.json(returnedResults[0])
    } catch (error) {
        console.error(`There was an error fetching results data.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the results for the race.` })
    }

})

//GET - get all results or results by race and year (if provided)
// router.get('/:raceName', async (req, res) => {
//     try {
//         const queryStatement = `
//         SELECT *
//         FROM results
//         WHERE
//         lower(replace(raceName, " ", "")) = "${req.params.raceName}"
//         ${req.query.raceYear ?
//                 'AND year = "' + req.query.raceYear + '"' : ''}
//         ORDER BY
//         year desc, place
//             `
//         const returnedResults = await connection.query(queryStatement)
//         res.json(returnedResults[0])
//     } catch (error) {
//         console.error(`There was an error fetching results data - provided params racename: ${req.params.raceName} year ${req.params.raceYear}.  Error: ${error}`);
//         res.status(500).json({ "message": `There was an error fetching the results for the race: ${req.params.raceName} and year ${req.params.raceYear}` })
//     }
// })

//GET - get all available years grouped by race name
router.get('/resultYears', async (req, res) => {
    console.log('years')
    try {
        // const queryStatement = `select DISTINCT raceName, GROUP_CONCAT(distinct year SEPARATOR ", ") as raceYears from results group by raceName`
        const queryStatement = `select DISTINCT raceName, year as raceYear, GROUP_CONCAT(distinct raceCategory SEPARATOR ", ") as raceCategory from results group by raceName, raceYear`
        const returnedRaceYears = await connection.query(queryStatement)
        console.log(returnedRaceYears)
        res.json(returnedRaceYears[0])
    } catch (error) {
        console.error(`There was an error fetching result years data.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the result years by race` })
    }
})

module.exports = router