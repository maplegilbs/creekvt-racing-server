const express = require('express')
const router = express.Router()
const mysql = require('mysql2')
const bcrypt = require('bcrypt')
const saltRounds = Number(process.env.saltRounds);

const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();

router.use(express.json())

router.post('/adduser', async (req, res) => {
    try {
        const { userName, password, name, races } = req.body;
        const salt = bcrypt.genSaltSync(saltRounds)
        const hashedPassword = bcrypt.hashSync(password, salt)
        const values = [userName, hashedPassword, name, JSON.stringify(races)]
        const queryStatement = `insert into users (username, password, name, races) values(?,?,?,?)`;
        const insertedUser = await connection.query(queryStatement, values)
        res.status(200).json(insertedUser)
    } catch (error) {
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})



module.exports = router;
