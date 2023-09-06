const router = require("express").Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const validateSession = require("../middleware/validate-session");

// photo endpoints

router.get("/view-all", validateSession, async (req, res) => {
  try {
    console.log("View All Here");
    const sql = `SELECT * FROM gomot1_july_cohort.photos`;
    db.query(sql, (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    });
    res.json({
      message: "View All Successful",
      photos: results,
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/view/:athleteId", validateSession, async (req, res) => {
  try {
    console.log("View by Athlete ID Here");
    const athleteId = req.params.athleteId;
    const sql = `SELECT * FROM gomot1_july_cohort.photos WHERE athleteId = ?`;
    db.query(sql, [athleteId], (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    });
    res.json({
      message: "View All By Athlete ID Successful",
      photos: results,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/view/:raceId", validateSession, async (req, res) => {
  try {
    console.log("View by Race ID Here");
    const raceId = req.params.raceId;
    const sql = `SELECT * FROM gomot1_july_cohort.photos WHERE raceId = ?`;
    db.query(sql, [raceId], (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    });
    res.json({
      message: "View All By Race ID Successful",
      photos: results,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
