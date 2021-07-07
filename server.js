require("dotenv/config");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const packageRoute = require("./route/package");
const userRoute = require("./route/user");
const adminRoute = require("./route/admin");
const orderRoute = require("./route/order");
const image = require("./route/Image")

const app = express();
app.use(cors());
// app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Connect to database
mongoose.connect(process.env.MOGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error: ")
);
mongoose.connection.once("open", function () {
  console.log("connected to db");
  // app.use(function (req, res, next) {

  //   var allowedDomains = ['http://localhost:3001','http://localhost:8080' ];
  //   var origin = req.headers.origin;
  //   if(allowedDomains.indexOf(origin) > -1){
  //     res.setHeader('Access-Control-Allow-Origin', origin);
  //   }
  
  //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  //   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
  //   res.setHeader('Access-Control-Allow-Credentials', true);
  
  //   next();
  // })

  //First page
  app.get("/", (req, res) => {
    // res.render('filename view',{object},(err) => {})
    return res.send("hello khemdev");
  });

  //Package Part
  app.use("/packages", packageRoute);

  //User Part
  app.use("/customers", userRoute);

  //Admin Part
  app.use("/admins", adminRoute);

  //Order Part
  app.use("/orders", orderRoute);

  //test image upload
  app.use("/image",image)

  //View engines
  // app.set("view engine", "ejs");

  app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + " not found" });
  });

  const PORT = process.env.PORT ;
  app.listen(PORT, function () {
    return console.log("Running server on port " + PORT);
  });
});
