const express = require("express");
const router = express.Router();
const User = require("../model/Customer_model");
const Package = require("../model/Package_model");
const Order = require("../model/Order_model");
const Admin = require("../model/Admin_model");

router.get("/", async (req, res) => {
  await Order.find({}, { __v: 0 }, (err, orders) => {
    if (err) {
      return res.json({ success: false, err });
    }
    if (orders.length == 0) {
      return res.json({ success: true, message: "Empty order" });
    }
    // console.log(orders.user);
    return res.json({
      success: true,
      message: "there is " + orders.length + " orders",
      orders,
    });
  }).populate("user packages admin", "name");
});

router.get("/filter", async (req, res) => {
  if (req.query === undefined || req.query === "" || req.query === " ") {
    return res
      .status(202)
      .json({
        success: false,
        result: [],
        message: "No filter",
      })
      .end();
  }
  try {
    //filter by status
    if (req.query.status) {
      console.log(req.query.status);
      Order.find(req.query, (err, orders) => {
        if (err) return res.json({ success: false });
        if (orders.length == 0)
          return res.json({ success: true, messages: "order is empty" });
        return res.json({ success: true, amount: orders.length, orders });
      }).populate("user packages admin");
    }
    //filter by date
    if (req.query.calender) {
      console.log(req.query.calender);
      const date = req.query.calender.split("-");
      console.log(date);

      const day = parseInt(date[0]),
        nextday = parseInt(date[0]) + 1,
        month = parseInt(date[1]),
        year = date[2];
      Order.find(
        {
          date: {
            $gte: new Date(`${year}-${month}-${day}`),
            $lt: new Date(`${year}-${month}-${nextday}`),
          },
        },
        (err, orders) => {
          if (err) return res.json({ success: false, err });
          if (orders.length == 0)
            return res.json({ success: true, messages: "order is empty" });
          return res.json({ success: true, amount: orders.length, orders });
        }
      ).populate("user packages admin");
    }
    //filter by province of deliveryAddress
    if (req.query.province) {
      let matches = await User.find(
        { "deliveryAddress.province": req.query.province },
        { _id: 1 }
      );
      let users = [];
      matches.forEach((user) => users.push(user._id));

      await Order.find({ user: { $in: users } }, (err, orders) => {
        if (err) return res.json({ success: false, error: err });
        if (orders.length == 0)
          return res.json({ success: true, messages: "order is empty" });
        return res.json({ success: true, amount: orders.length, orders });
      }).populate("user packages admin");
    }
    //filter by order id
    if (req.query._id) {
      // console.log(req.query._id);
      await Order.find({ _id: req.query._id }, async (err, order) => {
        if (err) return res.json({ success: false, error: err });
        console.log(order);
        return res.json({
          success: true,
          messages: "This is order " + `${req.query._id}`,
          order,
        });
      }).populate("user packages admin");
    }

    //filter by package id
    if (req.query.packageId) {
      let matches = await Package.find(
        { _id: req.query.packageId },
        { _id: 1 }
      );
      let packages = [];
      matches.forEach((package) => packages.push(package._id));

      await Order.find({ packages: { $in: packages } }, (err, orders) => {
        if (err) return res.json({ success: false, error: err });
        if (orders.length == 0)
          return res.json({ success: true, messages: "order is empty" });
        return res.json({ success: true, amount: orders.length, orders });
      }).populate("user packages admin");
    }
  } catch {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
    });
  }
});

router.post("/", async (req, res) => {
  const { userId, packageId, adminId } = req.body;

  // "userId" : "60cb6fede2e2f62a342a8bd1",
  // "packageId" :[ "60c2f4af8c6f4b2634bda6ab","60c3061ad98847925c4b0f47"]
  // "adminId" : ""

  console.log(userId, packageId, adminId);
  if (userId == undefined || packageId == undefined)
    return res.json({
      success: false,
      message: "userId or packageId is invalid",
    });

  const userOrder = await User.findOne(
    { _id: userId },
    {
      name: 1,
      nationalId: 1,
    }
  );

  const packageOrder = await Package.find(
    { _id: { $in: packageId } },
    {
      name: 1,
      package_type: 1,
      price: 1,
    }
  );

  const adminOrder = await Admin.findOne({ _id: adminId }, { fullName: 1 });

  var datetime = new Date();
  console.log(datetime.toISOString().slice(0, 10));

  Order.create(
    {
      user: userOrder,
      packages: packageOrder,
      date: datetime,
      admin: adminOrder,
    },
    (err, order) => {
      if (err) return res.json({ success: false, err });

      return res.json({
        success: true,
        messages: "Order add successfully",
        order,
      });
    }
  );
});

router.delete("/:id", async (req, res) => {
  await Order.findByIdAndRemove(req.params.id, (err, order) => {
    if (err) return res.json({ success: false, err });
    return res.json({ success: true, messages: "Order is deleted", order });
  });
});

router.put("/:id", async (req, res) => {
  //update status,admin @body status,by
  try {
    const result = await Order.findOneAndUpdate(
      { _id: req.params.id },
      {
        status: req.body.status,
        admin: req.body.admin,
        proceedDate: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).exec();

    return res.status(200).json({
      success: true,
      result,
      message: "we update this document by this id: " + req.params.id,
    });
  } catch (err) {
    if (err.name == "ValidationError") {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Required fields are not supplied",
      });
    } else {
      return res.status(500).json({
        success: false,
        result: null,
        message: "Oops there is an Error",
      });
    }
  }
});

module.exports = router;
