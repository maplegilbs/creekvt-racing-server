//  User/Racers Comment
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");
require("dotenv").config();
const adminSession = require("../middleware/admin-session");

//user registration
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, age, gender, isAdmin, password } =
      req.body;
    const hashedPassword = await bcrypt.hashSync(password, 10);
    const result = db.query(
      `insert into athletes(firstName, lastName, email, age, gender, isAdmin, password) VALUES (?,?,?,?,?,?,?)`,
      [firstName, lastName, email, age, gender, isAdmin, hashedPassword],
      (error, results, fields) => {
        if (error) {
          throw Error(error);
        }
        let userId = results.insertId;
        let token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
          expiresIn: 60 * 60 * 72,
        });
        res.json({
          message: "User Registration Success.",
          user: `${firstName} ${lastName}`,
          token,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    db.query(
      `SELECT id, email, password FROM athletes WHERE LOWER(email) = ?`,
      [email.toLowerCase()],
      (error, results, fields) => {
        if (error) {
          throw Error(error);
        }
        if (results.length === 0) {
          return res.status(401).json({ message: "invalid email or password" });
        } else {
          const isPasswordAMatch = bcrypt.compareSync(
            password,
            results[0].password
          );
          if (!isPasswordAMatch) {
            return res.status(401).json({ message: "Invalid password" });
          } else {
            let token = jwt.sign(
              {
                userId: results[0].id,
                email: results[0].email,
              },
              process.env.JWT_SECRET,
              { expiresIn: 60 * 60 * 72 }
            );
            res.json({ message: "login successful.", token });
          }
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:email", adminSession, async (req, res) => {
  try {
    const deletedEmail = req.params.email;
    db.query(
      `DELETE FROM athletes WHERE LOWER(email) = ?`,
      [deletedEmail.toLowerCase()],
      (error, results, field) => {
        if (error) {
          throw Error(error);
        }
        if (results.affectedRows > 0) {
          res.json({ Message: `Account tied to ${deletedEmail} was deleted` });
        } else {
          res
            .status(404)
            .json({ Message: `No account found with email ${deletedEmail}` });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/update/:id", adminSession, async (req, res) => {
  try {
    const id = req.params.id;
    const { firstName, lastName, age, gender } = req.body;
    let updateFields = [];
    let updateValues = [];

    if (firstName !== undefined) {
      updateFields.push("firstName = ?");
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push("lastName = ?");
      updateValues.push(lastName);
    }
    if (age !== undefined) {
      updateFields.push("age = ?");
      let ageValue = parseInt(age);
      updateValues.push(ageValue);
    }
    if (gender !== undefined) {
      updateFields.push("gender = ?");
      updateValues.push(gender);
    }
    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }
    let idValue = parseInt(id);
    updateValues.push(idValue);
    let updateQuery = `UPDATE athletes SET ${updateFields.join(
      ", "
    )} WHERE id = ?`;
    db.query(updateQuery, updateValues, (error, results, fields) => {
      if (error) {
        throw Error(error);
      }
      if (results.length === 0) {
        res.status(404).json({ message: "Athlete not found" });
      } else {
        res.status(200).json({
          message: "Athlete updated successfully",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
