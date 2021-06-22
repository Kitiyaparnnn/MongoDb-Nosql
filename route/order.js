const express = require("express");
const router = express.Router();
const User = require("../model/User_model");
const Package = require("../model/Package_model");
const Order = require("../model/Order_model");

router.get("/all", (req, res) => {
  Order.find({}, (err, orders) => {
    if (err) return res.json({ success: false, error: err });
    if (orders.length == 0)
      return res.json({ success: true, message: "Empty order" });
    return res.json({ success: true, orders });
  }).populate('user packages','name -_id')
});

router.post("/addOrder", async (req, res) => {
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
  console.log(userOrder, packageOrder);
  Order.create(
    {
      user: userOrder,
      packages: packageOrder,
    },
    (err, order) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, order });
    }
  );
});

module.exports = router;
