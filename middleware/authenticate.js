const jwt = require('jsonwebtoken');

async function authenticateUser(req, res, next) {
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
            req.userName = decodedToken.userName
            req.races = decodedToken.races
            if (!req.userName) {
                throw new Error("Username not found")
            }
            next()
        }
        else { throw new Error("No authorization information provided") }
    } catch (error) {
        console.error('Error in authentication:', error)
        res.status(403).json({ "message": "User not validated" })
    }
}

module.exports = { authenticateUser }