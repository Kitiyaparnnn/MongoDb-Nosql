const express = require("express");
const router = express.Router();
const User = require("../model/User_model");
const multer = require("multer");
var fs = require("fs");
var path = require("path");

//upload process
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "faceImage")
      cb(null, path.join("./images/faceImage/"));
    if (file.fieldname === "citizenImage") 
      cb(null, path.join("./images/citizenImage/"));
    if (file.fieldname === "univImage")
      cb(null, path.join("./images/univImage/"));
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.substr(file.originalname.lastIndexOf("."));
    cb(null, file.fieldname + ext);
  },
});

const upload = multer({ storage: storage });
const multiUploads = upload.fields([
  { name: "faceImage", maxCount: 1 },
  { name: "citizenImage", maxCount: 1 },
  { name: "univImage", maxCount: 1 },
]);

//Get all users
router.get("/all", async (req, res) => {
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

router.post("/adduser", multiUploads, (req, res) => {
  const {
    firstname,
    lastname,
    birthday,
    nationalId,
    houseNo,
    subdistrict,
    district,
    province,
    postcode,
    phoneNumber,
    email,
    university,
  } = req.body;

  if (nationalId.length != 13) {
    return res.json({ success: false, message: "nationalId must have 13 digits" });
  }

  if (phoneNumber.length < 9 || phoneNumber.length > 10) {
    return res.json({ success: false, message: "mobile is not valid" });
  }

  const newuser = {
    name: firstname + " " + lastname,
    birthday,
    nationalId,
    address:{
      houseNo,
      subdistrict,
      district,
      province,
      postcode
    },
    phoneNumber,
    email,
    university,
    photos: {
      faceImage: req.files.faceImage[0].path,
      citizenImage: req.files.citizenImage[0].path,
      univImage: req.files.univImage[0].path,
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
