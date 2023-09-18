require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { Sequelize } = require("sequelize");
const app = express();
const MySQL = require("mysql");
app.use(express.json());



// Controllers
const usersController = require("./controllers/users");
const racesController = require("./controllers/races");
const photosController = require("./controllers/photos");
const resultsController = require("./controllers/results");
const stripeController = require("./controllers/stripe")
const PORT = 3307;

// Connecting to the DB (defined in db.js)
app.use(cors());
app.use(express.json());
const db = require("./db");

db.once("open", () => console.log("connected to the DB: " + db.host));

// Routes
app.use("/users", usersController);
app.use("/races", racesController);
app.use("/photos", photosController);
app.use("/race-results", resultsController);
app.use("/register" , stripeController);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});