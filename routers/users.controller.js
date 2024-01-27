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

//POST -- Add a user - right now setup via postman - need to add admin authentication check for front web based setup -- PROTECTED
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
        res.status(500).json({ "message": `There was an error adding the user.  Contact the site admin for more information.` })
    }
})


//POST -- Allow user to login and return JWT if successfull
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
            //!need to set expiry for token
            const token = jwt.sign({userName, name, races, role}, process.env.JWT_SECRET)
            res.status(200).json(token)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ "message": `There was an error logging in.  Contact the site admin for more information.` })
    }
})

//GET -- Get user name and races available to user -- PROTECTED
router.get('/userInfo', authenticateUser, async (req, res) => {
    let name = req.name;
    let races = req.races;
    res.status(200).json({name, races})
})

//PATCH -- Update users password.  User name is brought in via the authenticate user middleware so as to protect / prevent user from updating another users password -- PROTECTED
router.patch('/updatePassword', authenticateUser, async(req, res) => {
    try {
        const{userName} = req;
        const{password, newPassword} = req.body;
        const queryStatement = ` select * from users where userName = "${userName}"`;
        const returnedUser = await connection.query(queryStatement);
        if (returnedUser[0].length === 0) {res.status(401).json({ "message": `Username / password incorrect` })}
        else if (!bcrypt.compareSync(password, returnedUser[0][0].password)){res.status(401).json({ "message": `Username / password incorrect` })}
        else {
             const updateStatement = `update users set password = ? where userName = ?`
             const updateValues = [bcrypt.hashSync(newPassword, saltRounds), userName]
             let updatedUser = await connection.query(updateStatement, updateValues)
             res.status(200).json({message: `Updated password for ${userName} successfully.`})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ "message": `There was an error updating the password.  Contact the site admin for more information.` })
    }

})


module.exports = router;
