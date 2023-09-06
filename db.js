const MySQL = require("mysql");

const db = MySQL.createPool({
  host: "gomotherrucker.com",
  user: "gomot1_july_cohort",
  password: "upright1234!",
  database: "gomot1_july_cohort",
  multipleStatements: true,
});
module.exports = db;
