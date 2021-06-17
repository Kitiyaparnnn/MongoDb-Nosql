const express = require("express");
const router = express.Router();
const User = require("../model/User_model");
const multer = require("multer");
var fs = require("fs");
var path = require("path");

//upload process
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join('./images/'));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

//Get all users
router.get("/", async (req, res) => {
  await User.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data });
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  await User.findById(id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data });
  });
});

router.post("/", upload.array("photoes"), async (req, res) => {
  const { name, date, Idcard, address, mobile, email, school, photo } =
    req.body;

  const newuser = {
    name,
    date,
    Idcard,
    address,
    mobile,
    email,
    school,
    photo: {
      user_idcard: fs.readFileSync(
        path.join('./images/' + req.file.filename)
      ),
      idcard: fs.readFileSync(
        path.join('./images/' + req.file.filename)
      ),
      studentcard: fs.readFileSync(
        path.join('./images/' + req.file.filename)
      ),
    },
  };
  await User.create(newuser, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    else {
      return res.json({ success: true, data });
    }
  });
});



module.exports = router;
