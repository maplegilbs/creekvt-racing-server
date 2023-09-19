// Imports
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const validateSession = require("../middleware/validate-session");
const adminSession = require("../middleware/admin-session");

//View All Endpoint
router.get("/view-all", async (req, res) => {
  try {
    const query = "SELECT * FROM races";
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        res.status(404).json({ message: "No races found" });
      } else {
        res.json({ races: results });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View One Endpoint

router.get("/view/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const query = `SELECT * FROM races WHERE LOWER(name) = "${name.replaceAll(
      "-",
      " "
    )}"`;
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        res.status(404).json({ message: "No races found" });
      } else {
        res.json({ races: results });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add New Race
router.post("/new", async (req, res) => {
  try {
    const {
      name,
      year,
      difficulty,
      location,
      numberOfLaps,
      format,
      date,
      startTime,
      putIn,
      takeOut,
      fallBackDate,
      gauges,
      organizerContact,
      affiliatedOrganization,
    } = req.body;
    db.query(
      `INSERT INTO races(name, year, difficulty, location, numberOfLaps, format, date, startTime, putIn, takeOut, fallBackDate, gauges, organizerContact, affiliatedOrganization) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        year,
        difficulty,
        location,
        numberOfLaps,
        format,
        date,
        startTime,
        putIn,
        takeOut,
        fallBackDate,
        gauges,
        organizerContact,
        affiliatedOrganization,
      ],
      (error, results, fields) => {
        if (error) {
          throw Error(error);
        }
        console.log(results);
        let raceId = results.insertId;
      }
    );
    res.json({
      message: "New Race Added",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Race

router.delete("/delete/:race_id", async (req, res) => {
  try {
    const raceId = req.params.race_id;
    const query = `DELETE FROM races WHERE id = ${raceId}`;
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        res.status(404).json({ message: "Race not found" });
      } else {
        res.json({ message: "Race deleted." });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Race

router.patch("/update/:race_id", async (req, res) => {
  try {
    const {
      name,
      difficulty,
      location,
      numberOfLaps,
      registeredRacers,
      format,
      date,
      startTime,
      putIn,
      takeOut,
      fallBackDate,
      gauges,
      organizerContact,
      affiliatedOrganization,
    } = req.body;
    const id = req.params.race_id;
    let updates = [];
    Object.keys(req.body).forEach((key) => {
      updates.push(`${key} = "${req.body[key]}"`);
    });
    if (updates.length > 0) {
      if (updates.length > 1) {
        db.query(
          `UPDATE races SET
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
          message: "Race Updated",
        });
      } else {
        db.query(
          `UPDATE races SET
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
          message: "Race Updated",
        });
      }
    } else {
      res.status(404).json({ message: "No data given." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register Existing Athlete Endpoint
router.post("/register-existing/:race_id/:athlete_id", async (req, res) => {
  try {
    const { race_id, athlete_id } = req.params;
    const { category, ACA } = req.body;
    const checkSQL = `SELECT * FROM athletes WHERE id = ${athlete_id}`;
    db.query(checkSQL, (error, results, fields) => {
      if (error) {
        throw Error(error);
      }
      if (results.length > 0) {
        const query = `
        INSERT INTO registeredAthletes (raceId, athleteId, firstName, lastName, age, email, phone, category, ACA) VALUES (?,?,?,?,?,?,?,?,?)`;
        db.query(
          query,
          [
            race_id,
            athlete_id,
            results[0].firstName,
            results[0].lastName,
            results[0].age,
            results[0].email,
            results[0].phone,
            category,
            ACA,
          ],
          (error, result, fields) => {
            if (error) {
              throw Error(error);
            }

            // Get the ID of the newly inserted registered athlete.
            const userId = result.insertId;

            // Respond to the client with a success message.
            res.json({
              message: "Athlete successfully registered for race.",
            });
          }
        );
      } else {
        // If the ID doesn't exist in another_table, return an error response
        res.status(404).send("ID not found in another_table");
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register New Athlete Endpoint
router.post("/register-new/:race_id", async (req, res) => {
  try {
    const { firstName, lastName, age, email, phone, category, ACA } = req.body;
    const { race_id } = req.params;
    db.query(
      `INSERT INTO registeredAthletes(raceId, firstName, lastName, age, email, phone, category, ACA) VALUES (?,?,?,?,?,?,?,?)`,
      [race_id, firstName, lastName, age, email, phone, category, ACA],
      (error, results, fields) => {
        if (error) {
          throw Error(error);
        }
        let registeredAthleteId = results.insertId;
      }
    );
    res.json({
      message: "Athlete Successfully Registered for Race",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View All Registered Athletes Endpoint
router.get("/view-registered-athletes/:race_id", async (req, res) => {
  try {
    const { race_id } = req.params;
    const query = `SELECT * FROM registeredAthletes WHERE raceId = ${race_id}`;
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        res.status(404).json({
          message: "Race not found or no currently registered racers",
        });
      } else {
        res.json({ registeredRacers: results });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Athlete View All Registered Races Endpoint
router.get("/view-registered-races/:race_id/:athlete_id", async (req, res) => {
  try {
    const { race_id, athlete_id } = req.params;
    const query = `SELECT races.name, races.year FROM races JOIN registeredAthletes ON races.id = registeredAthletes.raceId WHERE registeredAthletes.raceId = ${race_id} AND registeredAthletes.athleteId = ${athlete_id}`;
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        res.status(404).json({ message: "No races found" });
      } else {
        res.json({ registeredRaces: results });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Registered Racer Endpoint
router.delete("/delete-athlete/:race_id/:email", adminSession, async (req, res) => {
  try {
    const { race_id, email } = req.params;
    const query = `DELETE FROM registeredAthletes WHERE raceId = ${race_id} AND email ='${email}'`;
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        res.status(404).json({ message: "Athlete not found." });
      } else {
        res.json({ message: "Athlete deleted." });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Registered Racers
router.patch("/update-racers/:race_id/:athlete_email", async (req, res) => {
  try {
    const { race_id, athlete_email } = req.params;
    const {
      raceId,
      athleteId,
      firstName,
      lastName,
      age,
      email,
      phone,
      category,
      ACA,
    } = req.body;
    let updates = [];
    Object.keys(req.body).forEach((key) => {
      updates.push(`${key} = "${req.body[key]}"`);
    });
    if (updates.length > 0) {
      if (updates.length > 1) {
        db.query(
          `UPDATE registeredAthletes SET
      ${updates.join(", ")}
        WHERE raceId = ? AND LOWER(email) = ?`,
          [race_id, athlete_email.toLowerCase()],
          (error, results, fields) => {
            if (error) {
              throw Error(error);
            }
            console.log(results);
          }
        );
        res.json({
          message: "Registered Athletes List Updated",
        });
      } else {
        db.query(
          `UPDATE registeredAthletes SET
      ${updates.join(" ")}
        WHERE raceId = ? AND LOWER(email) = ?`,
          [race_id, athlete_email.toLowerCase()],
          (error, results, fields) => {
            if (error) {
              throw Error(error);
            }
            console.log(results);
          }
        );
        res.json({
          message: "Registered Athletes List Updated",
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
