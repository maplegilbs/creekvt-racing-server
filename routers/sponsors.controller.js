//Libraries
const router = require('express').Router();
const mysql = require('mysql2')
const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })
//Middleware
const { authenticateUser } = require('../middleware/authenticate')
//DB Connection
const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise()


//GET - Get sponsor images based on racename -- UNPROTECTED


//GET -- Get the table format -- PROTECTED
router.get('/tableInfo', authenticateUser, async (req, res) => {
    try {
        const queryStatement = `describe sponsors`
        const tableStructure = await connection.query(queryStatement)
        res.status(200).json(tableStructure[0])
    } catch (error) {
        console.error(`There was an error fetching the table structure`);
        res.status(500).json({ "message": `There was an error fetching the sponsor data ${error}` })
    }
})

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


//POST - Add a sponsor based on the race name -- PROTECTED
router.post('/:raceName', authenticateUser, upload.single('image'), async (req, res) => {
    //If image file provided, send file to inmotion php for uploading to folder there
    if (req.file) {
        try {
            const imageBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            await fetch("https://creekvt.com/races/imageUpload.php", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set the appropriate content type
                },
                body: JSON.stringify({
                    image: imageBuffer.toString('base64'),
                    fileName: fileName,
                    raceName: req.params.raceName.slice(0, req.params.raceName.length -4)
                })
            })
        } catch (error) {
            console.error(`Error uploading image to inmotion: ${error}`)
        }
    }
    try {
        let columnNames = [];
        let columnValues = [];
        for (let propertyName in req.body) {
            columnNames.push(propertyName);
            columnValues.push(req.body[propertyName])
        }
        const queryStatement = `insert into sponsors (${columnNames.join(',')}) values(${columnNames.map(columnName => '?').join(',')})`
        const insertedSponsor = await connection.query(queryStatement, columnValues)
        res.status(200).json(insertedSponsor[0])
    }
    catch (error) {
        console.error(`There was an error updating the item ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

//PATCH - Update a sponsor based on the race name and sponsor id -- PROTECTED
router.patch('/:raceName/:itemID', authenticateUser, upload.single('image'), async (req, res) => {
    //If image file provided, send file to inmotion php for uploading to folder there
    if (req.file) {
        try {
            const imageBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            await fetch("https://creekvt.com/races/imageUpload.php", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set the appropriate content type
                },
                body: JSON.stringify({
                    image: imageBuffer.toString('base64'),
                    fileName: fileName,
                    raceName: req.params.raceName.slice(0, req.params.raceName.length -4)
                })
            })
        } catch (error) {
            console.error(`Error uploading image to inmotion: ${error}`)
        }
    }
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
            const queryStatement = `update sponsors set ${updateInfoArray.join(', ')} where id = ${req.params.itemID}`
            const updatedItem = await connection.query(queryStatement)
            res.status(200).json(updatedItem[0])
        }
    } catch (error) {
        console.error(`There was an error updating the item ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})


//DELETE - delete a sponsor based on the sponsor ID -- PROTECTED
//! need to delete image from inmotion as well
router.delete('/:raceName/:sponsorId', authenticateUser, async (req, res) => {
    try {
        let modifiedRaces = req.races.map(race => race.split(' ').join('').toLowerCase())
        if (!modifiedRaces.includes(req.params.raceName)) {
            res.status(403).json({ "message": "Permission to modify selected race denied" })
        }
        const { sponsorId } = req.params;
        const queryStatement = `delete from sponsors where id=${sponsorId}`
        let deletedSponsor = await connection.query(queryStatement);
        res.status(200).json(deletedSponsor[0])
    } catch (error) {
        console.error(`There was an error deleting the item ${error}`);
        res.status(500).json({ "message": `There was an error updating the data ${error}` })
    }
})

module.exports = router;