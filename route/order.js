const express = require("express");
const router = express.Router();
const User = require("../model/User_model");
const Package = require("../model/Package_model");
const Order = require("../model/Order_model");

router.get("/", (req, res) => {
  Order.find({}, (err, order) => {
    if (err) return res.json({ success: false, error: err });
    if (order.length == 0)
      return res.json({ success: true, message: "Empty order" });
    return res.json({ success: true, order });
  }).populate('user packages')
});

router.post("/", (req, res) => {
  const { userId, packageId } = req.body;
  //   const newOrder = new Order();
  //   newOrder.user = User.find({ _id: userId });
  const user = new Order()
  user.user = User.find({ _id : userId},(err,user) => {
      if(err) return res.json({ success: false, error: err })
      return user
  })
  

  console.log(User);
  //   newOrder.package = Package.findById(packageId, (err, package) => {
  //     if (err) return res.json({ success: false, error });
  //     return package;
  //   });
  //   newOrder.save((err, order) => {
  //     if (err) return res.json({ success: false, error: err });
  //     return res.json({
  //       success: true,
  //       message: "Save order successfully",
  //       order,
  //     });
  //   });
  res.end();
});

module.exports = router;
