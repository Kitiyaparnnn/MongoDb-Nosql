const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const router = express.Router();
// const up = require("../uploads")
var multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, path.join(__dirname, '/uploads/'));
    cb(null, path.join('./images/'));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

const ImageSchema = new Schema({
  img: {
    data: Buffer,
    comtentType: String,
  },
});
const Image = mongoose.model("Image", ImageSchema);

router.post("/", upload.single("images"), (req, res) => {
  const newImage = new Image();
//   newImage.img.data = fs.readFileSync(
//     path.join(__dirname + "/uploads/" + req.file.filename)
//   );
  newImage.img.data = fs.readFileSync(
    path.join("./images/" + req.file.filename)
  );
  newImage.img.comtentType = "image/png";
  newImage.save((err, image) => {
    if (err) return res.json({ err });
    return res.json({ success: true });
  });
});

router.get("/", (req, res) => {
    Image.find({},(err,image) => {
        if(err) return res.json({ success: false, error: err })
        // return rea.render('front-end',{images :image})
        return res.json({success: true,image})
    })
});

module.exports = router;
