const router = require("express").Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const validateSession = require("../middleware/validate-session");

// photo endpoints

router.get("/view-all", async (req, res) => {
  try {
    
    const sql = `SELECT * FROM gomot1_july_cohort.photos`;
    db.query(sql, (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      } else {
        res.json({
          message: "View All Successful",
          photos: results,
        });
      }
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/view/:athleteId", async (req, res) => {
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
      } else {
        res.json({
          message: "View All By Athlete ID Successful",
          photos: results,
        });
      }
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/search/:raceName", async (req, res) => {
  try {
    console.log("View by Race ID Here");
    const raceName = req.params.raceName;
    const sql = `SELECT * FROM gomot1_july_cohort.photos WHERE LOWER(raceName) = ?`;
    
    db.query(sql, [raceName.replaceAll("-", " ").toLowerCase()], (err, results) => {
      if (err) {
        console.error("SQL Error:", err);
        res.status(500).json({
          message: "Internal Server Error",
        });
      }else{
         res.json({
      message: "RACE ID ENDPOINT WORKS",
      photos: results,
    });
      }
    });
   return;
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});




module.exports = router;
