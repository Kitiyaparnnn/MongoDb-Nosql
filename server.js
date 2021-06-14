require('dotenv/config')
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const jsonwebtoken = require("jsonwebtoken");
const packageRoute = require("./route/package");
const userRoute = require("./route/user")
const adminRoute = require("./route/admin")

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Connect to database
const db =
  "mongodb+srv://me123:me123@cluster0.xhvfg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(process.env.MOGODB_URI || db, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error: ")
);
mongoose.connection.once("open", function () {
  console.log("connected to db");

//First page
app.get("/",(req, res) => {
  return res.send('hello khemdev')
})

//Package Part
app.use("/package", packageRoute);

//User Part
app.use("/user",userRoute);

//Admin Part
app.use(function(req, res, next) {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jsonwebtoken.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function(err, decode) {
      if (err) req.user = undefined;
      req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

adminRoute(app)

app.use(function(req, res) {
  res.status(404).send({ url: req.originalUrl + ' not found' })
});

//View engines
// app.set("view engine", "ejs");

app.use(cors());

const PORT = process.env.PORT || 3001
app.listen(PORT, function () {
    return console.log("Running server on port " + PORT)
})
});
