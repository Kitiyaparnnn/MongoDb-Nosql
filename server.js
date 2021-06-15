require('dotenv/config')
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const packageRoute = require("./route/package");
const userRoute = require("./route/user")
const adminRoute = require("./route/admin")

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Connect to database
const db =
  "mongodb+srv://me123:me123@cluster0.xhvfg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(process.env.MOGODB_URI || db, 
  { useNewUrlParser: true, 
    useUnifiedTopology: true ,
    useCreateIndex:true ,
    useFindAndModify:false
  });

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
app.use((req, res, next) => {
  if (req.headers && req.headers.authorization ) {
    jwt.verify(req.headers.authorization, 'RESTFULAPIs', (err, decode) =>{
      if (err) req.Admin = undefined;
      req.Admin = decode;
      next();
    });
  } else {
    req.Admin = undefined;
    next();
  }
});

app.use("/admin",adminRoute) 

app.use((req, res) => {
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
