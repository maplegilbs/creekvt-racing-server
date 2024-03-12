//Libraries
const router = require("express").Router();
const mysql = require("mysql2");
const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();


router.get('/photographers', async (req, res) => {
    console.log(req.query)
    let photographers = req.query.names.split(", ").map(photographer => `"${photographer}"`).join(", ")
    console.log(photographers)
    try {
        const queryStatement = `select * from photographers where name IN (${photographers})`
        const photographerDetails = await connection.query(queryStatement);
        res.status(200).json(photographerDetails[0])
    } catch (error) {
        console.error(`There was an error fetching the photographers.  ${error}`);
        res.status(500).json({ "message": `There was an error fetching the photographers` })

    }
})

module.exports = router;