const express = require("express");
const router = express.Router();
const User = require("../model/User_model");
const Package = require("../model/Package_model");
const Order = require("../model/Order_model");

router.get("/", (req, res) => {
  Order.find({}, (err, orders) => {
    if (err) return res.json({ success: false, error: err });
    if (orders.length == 0)
      return res.json({ success: true, message: "Empty order" });
    return res.json({ success: true,message:"there is "+orders.length+" orders", orders });
  }).populate('user packages','name -_id')
});

router.get("/:id", async (req, res) => {
  const find = await Order.find({_id : req.params.id})
  console.log(find.user);
})

router.post("/", async (req, res) => {
  const { userId, packageId } = req.body;

  // "userId" : "60cb6fede2e2f62a342a8bd1",
  // "packageId" :[ "60c2f4af8c6f4b2634bda6ab","60c3061ad98847925c4b0f47"]

  const userOrder = await User.findById(userId, {
    name: 1,
    nationalId: 1,
    address: 1,
    phoneNumber: 1,
  });

  const packageOrder = await Package.find(
    { _id: { $in: packageId } },
    {
      name: 1,
      package_type: 1,
      price: 1,
    }
  );
  // console.log(userOrder, packageOrder);
  Order.create(
    {
      user: userOrder,
      packages: packageOrder,
    },
    (err, order) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, messages: "Order add successfully",order });
    }
  );
});

router.delete("/:id",async (req, res) => {
   await Order.findByIdAndDelete(req.params.id, (err, order) => {
      if(err) return res.json({ success: false, error: err })
      return res.json({ success: true,messages:'Order is deleted', order})
    })
})

module.exports = router;
