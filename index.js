//Libraries
const express = require('express')
const app = express();
const cors = require('cors')
require('dotenv').config();
//Routers
const racesRouter = require('./routers/races.controller.js')
const usersRouter = require('./routers/users.controller.js');
const racersRouter = require('./routers/racers.controller.js')
const geoInfoRouter = require('./routers/geoInfo.controller.js')
const scheduleRouter = requre('./routers/schedule.controller.js')
const PORT = process.env.PORT;

app.use(express.json())
app.use(cors())
app.use('/races', racesRouter)
app.use('/users', usersRouter)
app.use('/racers', racersRouter)
app.use('/geoInfo',geoInfoRouter)
app.use('/schedule', scheduleRouter)


app.listen(PORT, console.log(`Listening on port ${PORT}`))