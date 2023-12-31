//Libraries
const express = require('express')
const router = express.Router()
const mysql = require('mysql2')
const bcrypt = require('bcrypt')
const saltRounds = Number(process.env.SALTROUNDS);
const jwt = require('jsonwebtoken')
//Middleware
const {authenticateUser} = require('../middleware/authenticate.js')

const connection = mysql.createPool({
    host: process.env.REMOTE_HOST,
    user: process.env.REMOTE_USER,
    database: process.env.REMOTE_DATABASE,
    password: process.env.REMOTE_PASSWORD
}).promise();

router.use(express.json())

//need to add admin authentication check
router.post('/adduser', authenticateUser, async (req, res) => {
    try {
        const { userName, password, name, races } = req.body;
        const salt = bcrypt.genSaltSync(saltRounds)
        const hashedPassword = bcrypt.hashSync(password, salt)
        const values = [userName, hashedPassword, name, JSON.stringify(races)]
        const queryStatement = `insert into users (userName, password, name, races) values(?,?,?,?)`;
        const insertedUser = await connection.query(queryStatement, values)
        res.status(200).json(insertedUser)
    } catch (error) {
        console.error(error);
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body;
        const queryStatement = `select * from users where userName = "${userName}"`
        const returnedUser = await connection.query(queryStatement)
        if (returnedUser[0].length === 0) {res.status(401).json({ "message": `Username / password incorrect` })}
        else if (!bcrypt.compareSync(password, returnedUser[0][0].password)) {res.status(401).json({ "message": `Username / password incorrect` })}
        else {
            let userName = returnedUser[0][0].userName;
            let name = returnedUser[0][0].name;
            let role = returnedUser[0][0].role;
            let races = JSON.parse(returnedUser[0][0].races)
            const token = jwt.sign({userName, name, races, role}, process.env.JWT_SECRET)
            res.status(200).json(token)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ "message": `There was an error fetching the data ${error}` })
    }
})

router.get('/userInfo', authenticateUser, async (req, res) => {
    let name = req.name;
    let races = req.races;
    res.status(200).json({name, races})
})



module.exports = router;
