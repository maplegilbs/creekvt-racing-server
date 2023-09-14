const router = require("express").Router();
const jwt = require("jsonwebtoken");
const db = require("../db");

// View All Endpoint
router.get("/view-all", async (req, res) => {
  try {
    const query = "SELECT * FROM raceResults";
    db.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length === 0) {
        res.status(404).json({ message: "No results found" });
      } else {
        res.json({ results: results });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View by Race Name
router.get("/view-by-name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const query = `SELECT * FROM raceResults WHERE LOWER(raceName) = "${name.replaceAll("-", " ").toLowerCase()}"`;
    console.log(query);
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

// View by Year
router.get("/view-by-year/:name/:year", async (req, res) => {
  try {
    const { name, year } = req.params;
    const query = `SELECT * FROM raceResults WHERE LOWER(raceName) = '${name.toLowerCase()}' AND year = '${year}'`;
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

//View by Category
router.get("/view-by-category/:name/:category", async (req, res) => {
  try {
    const { name, category } = req.params;
    const query = `SELECT * FROM raceResults WHERE LOWER(raceName) = '${name.toLowerCase()}' AND LOWER(raceCategory) = '${category.toLowerCase()}'`;
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

// View by Athlete
router.get("/view-by-athlete/:athlete_name", async (req, res) => {
  try {
    const { athlete_name } = req.params;
    const query = `SELECT * FROM raceResults WHERE CONCAT(LOWER(firstName), ' ', LOWER(lastName)) LIKE '%${athlete_name.toLowerCase()}%'`;
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

// Add Results
router.post("/new", async (req, res) => {
  try {
    const {
      raceName,
      year,
      place,
      firstName,
      lastName,
      email,
      gender,
      payment,
      acaMember,
      raceCategory,
      partner1Name,
      bibNumber,
      time,
      fastestLap,
      lap1,
      lap2,
      athleteId,
    } = req.body;
    db.query(
      `INSERT INTO raceResults(raceName,
        year,
        place,
        firstName,
        lastName,
        email,
        gender,
        payment,
        acaMember,
        raceCategory,
        partner1Name,
        bibNumber,
        time,
        fastestLap,
        lap1,
        lap2,
        athleteId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        raceName,
        year,
        place,
        firstName,
        lastName,
        email,
        gender,
        payment,
        acaMember,
        raceCategory,
        partner1Name,
        bibNumber,
        time,
        fastestLap,
        lap1,
        lap2,
        athleteId,
      ],
      (error, results, fields) => {
        if (error) {
          throw Error(error);
        }
        let resultsId = results.insertId;
      }
    );
    res.json({ message: "Results Added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Hall of Champions Endpoint
router.get("/hall-of-champions/:year", async (req, res) => {
  try {
    const { year } = req.params;
    const query = `SELECT * FROM raceResults WHERE (place = '1' AND year = '${year}') OR (place = 'T-1' AND year = '${year}')`;
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

module.exports = router;
