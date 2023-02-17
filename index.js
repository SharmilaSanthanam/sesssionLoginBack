require('dotenv').config()
const session = require('express-session')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const MongoDBStore = require('connect-mongodb-session')(session) // add this package to store the user session id automatically on mongodb

const loginRouter = require('./userRoutes')
require('./database');
const http = require('http');
const path = require("path");

const app = express()
const MAX_AGE = 1000 * 60 * 60 * 3 // 3hrs
const port = process.env.PORT || 5001

const corsOptions = {
  // origin: 'http://localhost:3000',
  origin: '*',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// setting up connect-mongodb-session store
// in db, will have another collection (next to people) which is 'mySessions'
const mongoDBstore = new MongoDBStore({
  uri: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.l6dfhzk.mongodb.net/?retryWrites=true&w=majority`,
  collection: 'mySessions',
})

app.use(
  session({
    secret: 'a1s2d3f4g5h6',
    name: 'session-id', // cookies name to be put in "key" field in postman
    store: mongoDBstore,
    cookie: {
      maxAge: MAX_AGE, // this is when our cookies will expired and the session will not be valid anymore (user will be log out)
      sameSite: false,
      secure: false, // to turn on just in production
    },
    resave: true,
    saveUninitialized: false,
  })
)

app.use(cors(corsOptions))
app.use(express.json())

// ROUTERS
app.use('/api', loginRouter)

app.get("/", (req, res) =>
  res.send(`Server Running`)
);

// START SERVER
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

module.exports = app