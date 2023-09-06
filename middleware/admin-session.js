const jwt = require("jsonwebtoken")
const db = require("../db");

module.exports = function (req, res, next){
    if (req.method == "OPTIONS") {
        next();
    }else{
        let sessionToken = req.headers.authorization
        sessionToken 
        ? verifyToken() 
        : res.status(403).send({auth: false, error: "No Token Provided"});
        
        function verifyToken() {
            jwt.verify(sessionToken, "secret", (err, decoded) => {
                console.log(decoded);
                decoded 
                ? findUser(decoded) 
                : res.status(401).send({error: "Not Authorized"});
            });
        }
    }
    function findUser(decoded) {
        let sql = `SELECT * FROM athletes WHERE id = '${decoded.id}'`;

        db.query(sql, function (err, results, fields){
            if (results && results.length > 0) {
                const user = results[0];
                
                if(user.isAdmin){
                    req.user = user
                next();   
                
            }else{
                res.status(403).send({error: "Not an Admin"});
            }
            }else{
                res.status(404).send("User Not Found");
            }
        })
    }
}