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
    if(file.fieldname === 'profile')
      cb(null, path.join('./images/profile/'));
    if(file.fieldname === 'card')
      cb(null, path.join('./images/card/'));
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.substr(file.originalname.lastIndexOf('.'))
    cb(null, file.fieldname + ext);
  },
})

var upload = multer({ storage: storage }).fields([{ name:'profile',maxCount:1},{ name:'card',maxCount:1}])

const ImageSchema = new Schema({
  profile: {
    data: Buffer,
    contentType: String,
  },
  card: {
    data: Buffer,
    contentType: String,
  }
});
const Image = mongoose.model("Image", ImageSchema);

router.post("/", upload, (req, res) => {
  const newImage = new Image();
  newImage.profile.data = req.files.profile[0].path
  newImage.profile.contentType = 'img/png'
  newImage.card.data = req.files.card[0].path
  newImage.card.contentType = 'img/png'

  // newImage.profile.data =   fs.readFileSync("/profile/" + req.files.profile[0]) 
  // newImage.card.data = fs.readFileSync("/card/" + req.files.card[0])
  
  // newImage.img.data = fs.readFileSync(
  //   path.join("./images/" + req.file.filename)
  // );
  // newImage.img.contentType = "image/png";
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
