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
let gfsFace,gfsCitizen,gfsUniv;
mongoose.connection.once("open",() => {
  gfsFace = Grid(mongoose.connection.db,mongoose.mongo)
  gfsFace.collection("FaceImage")
  gfsCitizen = Grid(mongoose.connection.db,mongoose.mongo)
  gfsCitizen.collection("CitizenImage")
  gfsUniv = Grid(mongoose.connection.db,mongoose.mongo)
  gfsUniv.collection("UnivImage")
})

const storage = new GridFsStorage({
  url: process.env.MOGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const filename = file.originalname;
    let bName;
    if (file.fieldname === "faceImage") bName = "FaceImage";
    if (file.fieldname === "citizenImage") bName = "CitizenImage";
    if (file.fieldname === "univImage") bName = "UnivImage";
    return {
      filename: filename,
      bucketName: bName,
    };
  },
});

/*
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
*/

const upload = multer({ storage: storage });
const multiUploads = upload.fields([
  { name: "faceImage", maxCount: 1 },
  { name: "citizenImage", maxCount: 1 },
  { name: "univImage", maxCount: 1 },
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
router.get("/citizenImage/:filename", async (req, res) => {
  try {
    const file = await gfsCitizen.files.findOne({ filename: req.params.filename });
    const readStream = gfsCitizen.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});
router.get("/univImage/:filename", async (req, res) => {
  try {
    const file = await gfsUniv.files.findOne({ filename: req.params.filename });
    const readStream = gfsUniv.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});

//Get all users
router.get("/", async (req, res) => {
  await User.find({}, { name: 1, _id: 1 }, (err, users) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, users });
  });
});

//Get by id
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
    houseNo,
    subdistrict,
    district,
    province,
    postcode,
    houseNo_c,
    subdistrict_c,
    district_c,
    province_c,
    postcode_c,
    phoneNumber,
    email,
    university,
  } = req.body;

  if (nationalId.length != 13) {
    return res.json({
      success: false,
      message: "NationalId must have 13 digits",
    });
  }

  var check = 0
  phoneNumber.forEach((phone) => {
    if (phone.length != 10)
      return check++;
    return 0
  });
  if(check != 0){    
    return res.json({
      success: false,
      message: "Phone number is invalid",
    });
  }

  if (req.files.faceImage == undefined || req.files.citizenImage == undefined) {
    return res.send("must select the files");
  }
  if(req.files.univImage == undefined){
    return res.send("if you are not a student plase send your citizen image");
  }


  // console.log(req.files.univImage);
else{
  const faceUrl = `http://localhost:${process.env.PORT}/customers/faceImage/${req.files.faceImage[0].originalname}`,
    citizenUrl = `http://localhost:${process.env.PORT}/customers/citizenImage/${req.files.citizenImage[0].originalname}`,
    univUrl = `http://localhost:${process.env.PORT}/customers/univImage/${req.files.univImage[0].originalname}`;  

  console.log(faceUrl);
  console.log(citizenUrl);
  console.log(univUrl);
  const newuser = {
    name: firstname + " " + lastname,
    birthday,
    nationalId,
    address: {
      houseNo: houseNo,
      subdistrict: subdistrict,
      district: district,
      province: province,
      postcode: postcode,
    },
    addressDelivery: {
      houseNo: houseNo_c,
      subdistrict: subdistrict_c,
      district: district_c,
      province: province_c,
      postcode: postcode_c,
    },
    phoneNumber,
    email,
    university,
    photos: {
      faceImage: { link: faceUrl , data :req.files.faceImage[0]},
      citizenImage: { link: citizenUrl , data :req.files.citizenImage[0]},
      univImage: { link: univUrl , data :req.files.univImage[0]},
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
        gfsFace.files.deleteOne({ filename: user.photos.faceImage.data.filename });
        gfsCitizen.files.deleteOne({ filename: user.photos.citizenImage.data.filename });
        gfsUniv.files.deleteOne({ filename: user.photos.univImage.data.filename });
        return res.send("delete success");
      } catch (error) {
        console.log(error);
        return res.send("An error occured.");
      }
      /*
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
      */
    }
  });
});

module.exports = router;
