require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const User = require("../model/Customer_model");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const path = require("path");

//GridFS process
let gfsFace, gfsIden, gfsStudent;
mongoose.connection.once("open", () => {
  gfsFace = Grid(mongoose.connection.db, mongoose.mongo);
  gfsFace.collection("FaceImage");
  gfsIden = Grid(mongoose.connection.db, mongoose.mongo);
  gfsIden.collection("IdenImage");
  gfsStudent = Grid(mongoose.connection.db, mongoose.mongo);
  gfsStudent.collection("StudentImage");
});

const storage = new GridFsStorage({
  url: process.env.MOGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const filename = file.originalname;
    let bName;
    if (file.fieldname === "face") bName = "FaceImage";
    if (file.fieldname === "identifier") bName = "IdenImage";
    if (file.fieldname === "student") bName = "StudentImage";
    return {
      filename: filename,
      bucketName: bName,
    };
  },
});

const upload = multer({ storage: storage });
const multiUploads = upload.fields([
  { name: "face", maxCount: 1 },
  { name: "identifier", maxCount: 1 },
  { name: "student", maxCount: 1 },
]);

router.get("/faceImage/:filename", async (req, res) => {
  try {
    const file = await gfsFace.files.findOne({ filename: req.params.filename });
    const readStream = gfsFace.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});
router.get("/identifierImage/:filename", async (req, res) => {
  try {
    const file = await gfsIden.files.findOne({
      filename: req.params.filename,
    });
    const readStream = gfsIden.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});
router.get("/studentImage/:filename", async (req, res) => {
  try {
    const file = await gfsStudent.files.findOne({
      filename: req.params.filename,
    });
    const readStream = gfsStudent.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});

//Get all users
router.get("/", async (req, res) => {
  await User.find({}, { __v: 0 }, (err, users) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, users });
  });
});

router.get("/filter", async (req, res) => {
  try {
    let result;
    if (req.query.name) {
      result = await User.find({
        name: new RegExp("^" + `${req.query.name}` + "$", "i"),
      }).exec();
    } else {
      result = await User.find(req.query);
    }
    if (resault) {
      return res.json({
        success: true,
        message: "The result is " + result.length,
        result,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
    });
  }
});

router.post("/", multiUploads, (req, res) => {
  const {
    firstName,
    lastName,
    birthday,
    identifier,
    permanentAddress,
    deliveryAddress,
    phone,
    email,
    institution,
  } = req.body;
  const permanent = JSON.parse(permanentAddress);
  const delivery = JSON.parse(deliveryAddress);
  const phones = phone.replace(/ /g, "").split(",");
  const emails = email.replace(/ /g, "").split(",");

  var check = 0;
  phones.forEach((phones) => {
    if (phones.length != 10) return check++;
    return 0;
  });
  if (check != 0) {
    return res.json({
      success: false,
      message: "Phone number is invalid",
    });
  }

  if (req.files.face == undefined || req.files.identifier == undefined) {
    return res.send("must select the files");
  }
  if (req.files.student == undefined) {
    return res.send("if you are not a student plase send your citizen image");
  } else {
    const faceUrl = `${process.env.DEPLOY_URL}/customers/faceImage/${req.files.face[0].originalname}`;
    const idenUrl = `${process.env.DEPLOY_URL}/customers/identifierImage/${req.files.identifier[0].originalname}`;
    const studentUrl = `${process.env.DEPLOY_URL}/customers/studentImage/${req.files.student[0].originalname}`;
    console.log(faceUrl);
    console.log(idenUrl);
    console.log(studentUrl);
    const newuser = {
      name: firstName + " " + lastName,
      birthday,
      identifier,
      permanentAddress: permanent,
      deliveryAddress: delivery,
      phone: phones,
      email: emails,
      institution,
      image: {
        face: { link: faceUrl, data: req.files.face[0] },
        identifier: { link: idenUrl, data: req.files.identifier[0] },
        student: { link: studentUrl, data: req.files.student[0] },
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
  }
});

router.delete("/:id", async (req, res) => {
  await User.findByIdAndRemove(req.params.id, (err, user) => {
    if (err) return res.json({ success: false, error: err });
    else {
      try {
        gfsFace.files.deleteOne({
          filename: user.image.face.data.filename,
        });
        gfsIden.files.deleteOne({
          filename: user.image.identifier.data.filename,
        });
        gfsStudent.files.deleteOne({
          filename: user.image.student.data.filename,
        });
        return res.send("delete success");
      } catch (error) {
        console.log(error);
        return res.send("An error occured.");
      }
    }
  });
});

module.exports = router;
