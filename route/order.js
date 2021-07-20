const express = require("express");
const router = express.Router();
const User = require("../model/Customer_model");
const Package = require("../model/Package_model");
const Order = require("../model/Order_model");

router.get("/", async (req, res) => {
  await Order.find({}, {}, (err, orders) => {
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
  });
  // .populate("user packages", "name -id");
});

//Get by Id -> how to filter collection
router.get("/:id", async (req, res) => {
  if (req.params.id == "filter") {
    console.log(req.query.day);
    console.log(req.query.month);
    console.log(req.query.year);
    const day = (+req.query.day)+1,
      month = (+req.query.month)-1,
      year = (+req.query.year),
      nextday = day+1;
      console.log(day);
      console.log(month);
      console.log(year);
      const date = new Date(year,month,nextday);
    // const dateFilter = Order.filter((orders) => orders.date.toISOString().slice(0,10) == req.query.date)
    Order.find(
      {
        date: {
          $gte: new Date(year, month, day),
          $lt: new Date(year, month,nextday),
        },
      },
      (err, orders) => {
        if (err) return res.json({ success: false, err });
        return res.json({ success: true, message: orders });
      }
    );
    // return res.send(date)
  } else {
    await Order.findOne({ _id: req.params.id }, async (err, find) => {
      if (err) return res.json({ success: false, error: err });
      console.log(find.user, find.packages);
      const userData = await User.findById(
        { _id: find.user },
        { _id: 1, name: 1, phoneNumber: 1, addressDelivery: 1 }
      );
      const packagesData = await Package.findById(
        { _id: find.packages[0] },
        { _id: 1, name: 1 }
      );
      return res.json({ success: true, userData, packagesData });
    });
  }
});

//Get by Date
/*
router.get("/:date", async (req, res) => {
  console.log(req.params.date);
  await Order.findOne({ date: {$gte : new Date(req.params.date) }}, async (err, find) => {
    if(err) return res.json({ success: false, error: err })
    console.log(find.user, find.packages);
    const userData = await User.findById(
      { _id: find.user },
      { _id: 1, name: 1, phoneNumber1: 1, phoneNumber2: 1, addressDelivery: 1 }
    );
    const packagesData = await Package.findById(
      { _id: find.packages[0] },
      { _id: 1, name: 1 }
    );
    return res.json({ success: true, userData, packagesData})
  });
});
*/

router.post("/", async (req, res) => {
  const { userId, packageId } = req.body;

  // "userId" : "60cb6fede2e2f62a342a8bd1",
  // "packageId" :[ "60c2f4af8c6f4b2634bda6ab","60c3061ad98847925c4b0f47"]
  console.log(userId, packageId);
  if (userId == undefined || packageId == undefined)
    return res.json({
      success: false,
      message: "userId or packageId is invalid",
    });

  const userOrder = await User.find(
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

  var datetime = new Date();
  console.log(datetime.toISOString().slice(0, 10));

  Order.create(
    {
      user: userOrder,
      packages: packageOrder,
      date: datetime,
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

module.exports = router;
