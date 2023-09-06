//  User/Racers Comment
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");

//from router tech
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    await db.query(
      `insert into BrentUsers(firstName, lastName, email, password) VALUES (${firstName}, ${lastName}, ${email}, ${password})`
    );
    //need to change the values to ?,?,? and make prepared statements to fill in actual values
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//trying to get SQL to work
let registerUser = `Insert INTO BrentUsers (email, username, bio) VALUES ("steve@test.org", "steveJ0bs22", "My name is steve Jobs and I approve this message")`;
// db.query(registerUser, funciton (err,result,fields){});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = {};
    const data = req.body;
    const options = { new: true };
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
