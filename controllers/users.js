//  User/Racers Comment
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");
require("dotenv").config();

//user registration
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, age, gender, isAdmin, password } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `insert into athletes(firstName, lastName, email, age, gender, isAdmin, password) VALUES (?,?,?,?,?,?,?)`,
      [firstName, lastName, email, age, gender, isAdmin, hashedPassword]
    );

    let userId = result.insertId;
    let token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 72,
    });
    res.json({
      message: "User Registration Success.",
      user: `${firstName} ${lastName}`,
      token,
    });
    //need to change the values to ?,?,? and make prepared statements to fill in actual values
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [athletes] = db.query(
      `SELECT id, email, password FROM athletes WHERE email = ?`,
      [email]
    );
    if (athletes.length === 0) {
      return res.status(401).json({ message: "invalid email or password" });
    } else {
      const isPasswordAMatch = await bcrypt.compare(
        password,
        athletes[0].password
      );
      if (!isPasswordAMatch) {
        return res.status(401).json({ message: "Invalid password" });
      } else {
        let token = jwt.sign(
          {
            userId: athletes[0].id,
            email: athletes[0].email,
          },
          process.env.JWT_SECRET,
          { expiresIn: 60 * 60 * 72 }
        );
        res.json({ message: "login successful.", token });
      }
    }
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
