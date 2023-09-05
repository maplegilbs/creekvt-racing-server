//  User/Racers Comment
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
