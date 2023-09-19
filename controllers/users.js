//  User/Racers Comment
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");
require("dotenv").config();
const adminSession = require("../middleware/admin-session");

// User Registration
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      DOB,
      gender,
      isAdmin,
      password,
    } = req.body;
    console.log(typeof phone);
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query(
      `INSERT INTO athletes(firstName, lastName, email, phone, DOB, gender, isAdmin, password) VALUES (?,?,?,?,?,?,?,?)`,
      [firstName, lastName, email, phone, DOB, gender, isAdmin, hashedPassword],
      (error, results, fields) => {
        if (error) {
          throw Error(error);
        }
        let userId = results.insertId;
        let token = jwt.sign(
          { userId, email, firstName, isAdmin },
          process.env.JWT_SECRET,
          {
            expiresIn: 60 * 60 * 72,
          }
        );
        res.json({
          message: "User Registration Success.",
          user: `${firstName} ${lastName}`,
          token,
          isAdmin,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    db.query(
      `SELECT id, email, password, firstName, isAdmin FROM athletes WHERE LOWER(email) = ?`,
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
                firstName: results[0].firstName,
                isAdmin: results[0].isAdmin,
              },
              process.env.JWT_SECRET,
              { expiresIn: 60 * 60 * 72 }
            );
            let storedFirstName = results[0].firstName;
            let storedAdminCred = results[0].isAdmin;
            console.log(results);
            res.json({
              message: "login successful.",
              token,
              storedFirstName,
              storedAdminCred,
            });
          }
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Delete
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

// User Update
router.patch("/update/:id", adminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      DOB,
      gender,
      isAdmin,
      password,
    } = req.body;
    let updates = [];
    Object.keys(req.body).forEach((key) => {
      updates.push(`${key} = "${req.body[key]}"`);
    });
    if (updates.length > 0) {
      if (updates.length > 1) {
        db.query(
          `UPDATE athletes SET
      ${updates.join(", ")}
        WHERE id = ?`,
          [id],
          (error, results, fields) => {
            if (error) {
              throw Error(error);
            }
            console.log(results);
          }
        );
        res.json({
          message: "Athlete Information Updated",
        });
      } else {
        db.query(
          `UPDATE athletes SET
      ${updates.join(" ")}
        WHERE id = ?`,
          [id],
          (error, results, fields) => {
            if (error) {
              throw Error(error);
            }
            console.log(results);
          }
        );
        res.json({
          message: "Athlete Information Updated",
        });
      }
    } else {
      res.status(404).json({ message: "No data given." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
