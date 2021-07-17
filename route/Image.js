require("dotenv");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const fs = require("fs");
var multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
// const mongodb = require('mongodb');
// const GridFSBucket = mongodb.GridFSBucket;

let gfs,gfss,gridBucket;
mongoose.connection.once("open", function () {
  // gridBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db,{bucketName : images})
  // gfs = Grid(mongoose.connection.db)
  // gfs.collection("images")
  
  // gfs = new GridFSBucket(mongoose.connection.db,{bucketName: 'profile'});
  gfs = Grid(mongoose.connection.db,mongoose.mongo)
  gfs.collection("profile");
  // gfss = new GridFSBucket(mongoose.connection.db, {bucketName: 'card'});
  gfss = Grid(mongoose.connection.db,mongoose.mongo)
  gfss.collection("card");
});

router.get("/profile/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    const readStream = gfs.createReadStream(file.filename);
    // const readStream = gfs.openDownloadStreamByName(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});

router.get("/card/:filename", async (req, res) => {
  try {
    const file = await gfss.files.findOne({ filename: req.params.filename });
    const readStream = gfss.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    res.send("not found");
  }
});

/**Original multer*/
// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // cb(null, path.join(__dirname, '/uploads/'));
//     if (file.fieldname === "profile") cb(null, path.join("./images/profile/"));
//     if (file.fieldname === "card") cb(null, path.join("./images/card/"));
//   },
//   filename: (req, file, cb) => {
//     const ext = file.originalname.substr(file.originalname.lastIndexOf("."));
//     cb(null, file.originalname);
//   },
// });

/*GridFsStorage data:buffer -> object*/
const storage = new GridFsStorage({
  url: process.env.MOGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const filename = file.originalname;
    let bName;
    if (file.fieldname === "profile") bName = "profile";
    if (file.fieldname === "card") bName = "card";

    return {
      filename: filename,
      bucketName: bName,
    };
  },
});

var upload = multer({ storage: storage }).fields([
  { name: "profile", maxCount: 1 },
  { name: "card", maxCount: 1 },
]);

const ImageSchema = new Schema({
  profile: {
    link: String,
    data : Object,
  },
  card: {
    link: String,
    data : Object,
  },
});
const Image = mongoose.model("Image", ImageSchema);

router.post("/", upload, (req, res) => {
  if (req.files.profile == undefined || req.files.card == undefined) {
    return res.send("must select the files");
  }
  const profileUrl = `http://${process.env.PORT}/image/profile/${req.files.profile[0].originalname}`,
    cardUrl = `http://${process.env.PORT}/image/card/${req.files.card[0].originalname}`;
  console.log(req.files.profile[0]);
  console.log(req.files.card[0]);
  const newImage = new Image();

  /*GridFsStorage*/
  newImage.profile.link = profileUrl
  newImage.profile.data = req.files.profile[0];
  newImage.card.link = cardUrl
  newImage.card.data = req.files.card[0];


  /*Original*/
  // newImage.profile.data = req.files.profile
  // newImage.profile.contentType = "img/png";
  // newImage.card.data = req.files.card
  // newImage.card.contentType = "img/png";

  // newImage.profile.data =   fs.readFileSync("/profile/" + req.files.profile[0])
  // newImage.card.data = fs.readFileSync("/card/" + req.files.card[0])

  // newImage.img.data = fs.readFileSync(
  //   path.join("./images/" + req.file.filename)
  // );
  // newImage.img.contentType = "image/png";

  newImage.save((err, image) => {
    if (err)
      return res.json({
        message: "Plase rename your file name in english or number",
        err,
      });
    return res.json({ success: true, image });
  });
});

router.get("/", (req, res) => {
  Image.find({}, {}, (err, image) => {
    if (err) return res.json({ success: false, error: err });
    // return res.render('front-end',{images :image})
    return res.json({ success: true, image });
  });
});

router.delete("/:id", async (req, res) => {
  await Image.findByIdAndRemove({_id: req.params.id},(err,image) => {
    try {      
      console.log(image.profile.data.filename);
      console.log(image.card.data.filename);
       gfs.files.deleteOne({ filename: image.profile.data.filename });
      //  gfs.chunks.delete({ filename: image.profile.data.filename})
       gfss.files.deleteOne({ filename: image.card.data.filename });
      //  gfss.chunks.delete({ filename: image.card.data.filename})

      return res.send("success");
  } catch (error) {
      console.log(error);
      return res.send("An error occured.");
  }
  })
  
});

/*Original*/
// router.delete("/:id", async (req, res) => {
//   await Image.findByIdAndRemove(req.params.id, (err, image) => {
//     if (err) return res.json({ success: false, error: err });
//     else {
//       let profile = Buffer.from(image.profile.data);
//       let ppath = profile.toLocaleString();

//       let card = Buffer.from(image.card.data);
//       let cpath = card.toLocaleString();
//       console.log(ppath);
//       console.log(cpath);
//       let deleteFile = (files) => {
//         var i = files.length;
//         files.forEach((filepath) => {
//           fs.unlink(filepath, (err) => {
//             i--;
//             if (err) return res.json({ success: false, error: err });
//             if (i <= 0)
//               return res.json({
//                 success: true,
//                 message: "Images in local and server are deleted ",
//               });
//           });
//         });
//       };
//       var files = [ppath, cpath];
//       deleteFile(files);
//       // return res.json({ success: true,image})
//     }
//   });
// });

module.exports = router;
