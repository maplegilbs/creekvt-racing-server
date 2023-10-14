const express = require('express')
const app = express();
require('dotenv').config();
const mysql = require('mysql2')

const PORT = process.env.PORT

app.use(express.json())

const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();

const queryStatement = `select* from race_details`;



app.get('/', async (req, res) => {
    try {
        const returnedData = await connection.query(queryStatement);
        res.send(returnedData[0])
    } catch (error) {
        res.send(`There was an error fetching the data ${error}`)
    }
})

app.listen(PORT, console.log(`Listening on port ${PORT}`))