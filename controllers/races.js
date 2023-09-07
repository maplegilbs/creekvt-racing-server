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
    const query = `SELECT * FROM races WHERE name = ${name}`;
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
    db.query(
      `INSERT INTO races(name, difficulty, location, numberOfLaps, registeredRacers, format, date, startTime, putIn, takeOut, fallBackDate, gauges, organizerContact, affiliatedOrganization) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
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
    db.query(
      `UPDATE races SET
          name = ?,
          difficulty = ?,
          location = ?,
          numberOfLaps = ?,
          registeredRacers = ?,
          format = ?,
          date = ?,
          startTime = ?,
          putIn = ?,
          takeOut = ?,
          fallBackDate = ?,
          gauges = ?,
          organizerContact = ?,
          affiliatedOrganization = ?
        WHERE id = ?`,
      [
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
        id,
      ],
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
