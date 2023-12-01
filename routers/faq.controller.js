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


//GET -- Get the table format -- PROTECTED
router.get('/tableInfo', authenticateUser, async (req, res) => {
    try {
        const queryStatement = `describe race_faq`
        const tableStructure = await connection.query(queryStatement)
        res.status(200).json(tableStructure[0])
    } catch (error) {
        console.error(`There was an error fetching the table structure`);
        res.status(500).json({ "message": `There was an error fetching the faq data ${error}` })
    }
})

//GET -- Get FAQ based on specific race
router.get('/:raceName', async (req, res) => {
    const queryStatement = `select * from race_faq where lower(replace(raceName, " ", "")) = "${req.params.raceName}"`;
    try {
        const faqs = await connection.query(queryStatement);
        res.status(200).json(faqs[0])
    } catch (error) {
        console.error(`There was an error fetching faq data.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})



//POST -- Add FAQ
router.post('/:raceName', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) res.status(403).json({ "message": "Permission to modify selected race denied" })
        else {
            let columnNames = []
            let columnValues = []
            for (let propertyName in req.body) {
                columnNames.push(propertyName)
                columnValues.push(req.body[propertyName])
            }
            const queryStatement = `insert into race_faq (${columnNames.join(', ')}) values(${columnNames.map(columnName => '?').join(', ')})`
            let insertedFaq = await connection.query(queryStatement, columnValues)
            res.status(200).json(insertedFaq[0])
        }
    } catch (error) {
        console.error(`There was an error posting faq data.  Error: ${error}`);
        res.status(500).json({ "message": `There was an error post faq data ${error}` })
    }
})

//Delete -- Remove FAQ based on faq ID
router.delete("/:raceName/:itemID", authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) res.status(403).json({ "message": "Permission to modify selected race denied" })
        else {
            const queryStatement = `delete from race_faq where id = ${req.params.itemID}`
            const deletedItem = await connection.query(queryStatement)
            res.status(200).json(deletedItem[0])
        }
    } catch (error) {
        console.error(`There was an error deleting the item ${error}`);
        res.status(500).json({ "message": `There was an error deleting the item ${error}` })
    }
})


//PATCH -- Updated FAQ based on faq ID
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
            const queryStatement = `update race_faq set ${updateInfoArray.join(', ')} where id = ${req.params.itemID}`
            const updatedItem = await connection.query(queryStatement)
            res.status(200).json(updatedItem[0])
        }
    } catch (error) {
        console.error(`There was an error updating the item ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

module.exports = router;