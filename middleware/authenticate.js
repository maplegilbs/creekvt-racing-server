const jwt = require('jsonwebtoken');

//Looks for a JWT in request header.  If it exists and is verified, update the request with the userName, role and races the user is authorized to edit.  Then call the next function
async function authenticateUser(req, res, next) {
    try {
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let verifiedToken = await jwt.verify(token, process.env.JWT_SECRET);
            req.userName = verifiedToken.userName
            req.name = verifiedToken.name
            req.role = verifiedToken.role
            req.races = verifiedToken.races
            if (!req.userName || !req.role) {
                throw new Error("Username / Role not included in auth info")
            }
            next()
        }
        else { throw new Error("Authorization information not provided or invalid") }
    } catch (error) {
        console.error('Error in authentication:', error)
        res.status(403).json({ "message": "User not validated" })
    }
}

module.exports = { authenticateUser }