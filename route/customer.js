require("dotenv");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const User = require("../model/Customer_model");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const path = require("path");
const { v4 } = require("uuid");
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
    if (file.fieldname === "faceImage") bName = "FaceImage";
    if (file.fieldname === "identifierImage") bName = "IdenImage";
    if (file.fieldname === "studentImage") bName = "StudentImage";
    return {
      filename: filename,
      bucketName: bName,
    };
  },
});

const upload = multer({ storage: storage });
const multiUploads = upload.fields([
  { name: "faceImage", maxCount: 1 },
  { name: "identifierImage", maxCount: 1 },
  { name: "studentImage", maxCount: 1 },
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

//get all users
router.get("/", async (req, res) => {
  await User.find({}, { __v: 0 }, (err, users) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, users });
  });
});

router.get("/filter", async (req, res) => {
  //@param {ArrayObject}
  //ex. email  test9@test9.com
  const {
    _id,
    name,
    phone,
    email,
    institution,
    university,
    birthday,
    indentifier,
    nationality,
    currentAddress,
    deliveryAddress,
  } = req.query;
  console.log(req.query);
  try {
    let result;
    //filter by name
    if (name) {
      result = await User.find({
        name: new RegExp("^" + `${name}` + "$", "i"),
      });
    }
    //filter by info + id
    else if (
      phone ||
      email ||
      institution ||
      _id ||
      university ||
      birthday ||
      indentifier ||
      currentAddress ||
      deliveryAddress ||
      nationality
    ) {
      result = await User.find(req.query);
    }
     else {
      return res.json({
        success: false,
        message: "Required fields are not supplied",
      });
    }
    return res.json({
      success: true,
      message: "The result is " + result.length,
      result,
    });
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
    nationality,
    currentAddress,
    deliveryAddress,
    phone,
    email,
    institution,
  } = req.body;
  const current = JSON.parse(currentAddress);
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

  if (
    req.files.faceImage == undefined ||
    req.files.identifierImage == undefined
  ) {
    return res.send("must select the files");
  }

  // if (
  //   req.files.identifierImage[0].filename === req.files.faceImage[0].filename ||
  //   req.files.identifierImage[0].filename === req.files.studentImage[0].filename ||
  //   req.files.faceImage[0].filename === req.files.studentImage[0].filename
  // ) {
  //   return res.send("image is duplicated");
  // }
  const faceName = v4(),
    idenName = v4(),
    StuName = v4();
  const faceFile = req.files.faceImage[0],
    idenFile = req.files.identifierImage[0];
  (faceFile.originalname = faceName), (idenFile.originalname = idenName);
  const faceUrl = `${process.env.DEPLOY_URL}/customers/faceImage/${faceName}`;
  const idenUrl = `${process.env.DEPLOY_URL}/customers/identifierImage/${idenName}`;
  console.log(faceUrl);
  console.log(idenUrl);
  const image = {
    faceImage: { link: faceUrl, data: faceFile },
    identifierImage: { link: idenUrl, data: idenFile },
  };

  if (req.files.studentImage) {
    const stuFile = req.files.studentImage[0];
    stuFile.originalname = StuName;
    const studentUrl = `${process.env.DEPLOY_URL}/customers/studentImage/${StuName}`;
    console.log(studentUrl);
    image.studentImage = { link: studentUrl, data: stuFile };
  }

  const newuser = {
    name: firstName + " " + lastName,
    birthday,
    identifier,
    nationality,
    currentAddress: current,
    deliveryAddress: delivery,
    phone: phones,
    email: emails,
    institution,
    image: image,
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
      try {
        console.log(user.image.faceImage);
        gfsFace.files.deleteOne({
          filename: user.image.faceImage.data.filename,
        });
        console.log(user.image.identifierImage);
        gfsIden.files.deleteOne({
          filename: user.image.identifierImage.data.filename,
        });
        if (user.image.studentImage == "") {
          console.log(user.image.studentImage);
          gfsStudent.files.deleteOne({
            filename: user.image.studentImage.data.filename,
          });
        }
        // User.findByIdAndDelete(req.params.id)
        return res.send("delete success");
      } catch (error) {
        console.log(error);
        return res.send("An error occured.");
      }
    }
  });
});

module.exports = router;
