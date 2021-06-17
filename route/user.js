const express = require("express");
const router = express.Router();
const User = require("../model/User_model");
const multer = require("multer");
var fs = require("fs");
var path = require("path");

//upload process
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "user_idcard")
      cb(null, path.join("./images/user_idcard/"));
    if (file.fieldname === "idcard") cb(null, path.join("./images/idcard/"));
    if (file.fieldname === "studentcard")
      cb(null, path.join("./images/studentcard/"));
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.substr(file.originalname.lastIndexOf("."));
    cb(null, file.fieldname + ext);
  },
});

const upload = multer({ storage: storage });
const multiUploads = upload.fields([
  { name: "user_idcard", maxCount: 1 },
  { name: "idcard", maxCount: 1 },
  { name: "studentcard", maxCount: 1 },
]);

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

router.post("/", multiUploads, (req, res) => {
  const {
    firstname,
    lastname,
    date,
    idcard,
    houseNo,
    subdistrict,
    district,
    province,
    zipcode,
    mobile,
    email,
    school,
  } = req.body;

  if (idcard.length != 13) {
    return res.json({ success: false, message: "idcard must have 13 digits" });
  }

  if (mobile.length < 9 || mobile.length > 10) {
    return res.json({ success: false, message: "mobile is not valid" });
  }

  const newuser = {
    name: firstname + " " + lastname,
    date,
    Idcard: idcard,
    address:{
      houseNo,
      subdistrict,
      district,
      province,
      zipcode
    },
    mobile,
    email,
    school,
    photo: {
      user_idcard: req.files.user_idcard[0].path,
      idcard: req.files.idcard[0].path,
      studentcard: req.files.studentcard[0].path,
    },
  };
  User.create(newuser, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    else {
      return res.json({ success: true, data });
    }
  });
});

module.exports = router;
