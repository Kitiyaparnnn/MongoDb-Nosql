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
  }).populate("user packages");
});

router.post("/", (req, res) => {
  const { userId, packageId } = req.body;

  // const order = new Order();
  // user.user = Order.find({"user._id" : userId }, (err, user) => {
  //   if (err) return res.json({ success: false, error: err });
  //   return user;
  // }).populate('user');

  const userOrder = User.find({"_id" : userId})
  
  const packageOrder = Package.find({"_id" : packageId})

  // Order.create({
  //   user: userOrder,
  //   package: packageOrder
  // },(err, order) => {
  //   if(err) return res.json({ success: false, error: err })
  //   return res.json({ success:true , order})
  // })
 
  console.log(userOrder , packageOrder);
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

});

module.exports = router;
