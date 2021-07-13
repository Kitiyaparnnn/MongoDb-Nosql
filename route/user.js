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
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
const multiUploads = upload.fields([
  { name: "faceImage", maxCount: 1 },
  { name: "citizenImage", maxCount: 1 },
  { name: "univImage", maxCount: 1 },
]);

//Get all users
router.get("/", async (req, res) => {
  await User.find({}, { name: 1, _id: 1 }, (err, user) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, users: user });
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  await User.findById(id, (err, user) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, user });
  });
});

router.post("/", multiUploads, (req, res) => {
  const {
    firstname,
    lastname,
    birthday,
    nationalId,
   address,
   addressDelivery,
    phoneNumber,
    email,
    university,
  } = req.body;

  if (nationalId.length != 13) {
    return res.json({
      success: false,
      message: "nationalId must have 13 digits",
    });
  }

  if (phoneNumber.length < 9 || phoneNumber.length > 10) {
    return res.json({ success: false, message: "mobile is not valid" });
  }

  const newuser = {
    name: firstname + " " + lastname,
    birthday,
    nationalId,
    address,
    addressDelivery,
    phoneNumber,
    email,
    university,
    photos: {
      faceImage: req.files.faceImage[0].path,
      citizenImage: req.files.citizenImage[0].path,
      univImage: req.files.univImage[0].path,
    },
  };
  User.create(newuser, (err, user) => {
    if (err) return res.json({ success: false, error: err });
    else {
      return res.json({
        success: true,
        message: "Customer's data is saved",
        user,
      });
    }
  });
});

router.delete("/:id", async (req, res) => {
  await User.findByIdAndRemove(req.params.id, (err, user) => {
    if (err) return res.json({ success: false, error: err });
    else {
      let faceImage = Buffer.from(user.photos.faceImage.data);
      let fpath = faceImage.toLocaleString();

      let citizenImage = Buffer.from(user.photos.citizenImage.data);
      let cpath = citizenImage.toLocaleString();

      let univImage = Buffer.from(user.photos.univImage.data);
      let upath = univImage.toLocaleString();

      let deleteImage = (files) => {
        var i = files.length;
        files.forEach((filepath) => {
          fs.unlink(filepath, (err) => {
            i--;
            if (err) return res.json({ success: false, error: err });
            if (i <= 0)
              return res.json({ success: true, message: "User is deleted" });
          });
        });
      };
      var files = [fpath, cpath, upath];
      deleteImage(files);
    }
  });
});

module.exports = router;
