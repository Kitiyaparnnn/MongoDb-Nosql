require('dotenv/config')
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const packageRoute = require("./route/package");
const userRote = require("./route/user")

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
  return res.send('hello')
})

//Controll Package
app.use("/package", packageRoute);

//Collect Users
app.use("/user",userRote);



//View engines
// app.set("view engine", "ejs");

app.use(cors());

const PORT = process.env.PORT || 3001
app.listen(PORT, function () {
    return console.log("Running server on port " + PORT)
})
});
