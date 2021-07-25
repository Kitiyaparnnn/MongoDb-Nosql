const express = require("express");
const router = express.Router();
const User = require("../model/Customer_model");
const Package = require("../model/Package_model");
const Order = require("../model/Order_model");

router.get("/", async (req, res) => {
  await Order.find({}, {__v:0}, (err, orders) => {
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

    let results = await Order.find(fields);

    if (results.length >= 1) {
      return res.status(200).json({
        success: true,
        result: results,
        message: "Successfully found all documents",
      });
    } else {
      return res
        .status(202)
        .json({
          success: false,
          result: [],
          message: "No document found by this request",
        })
        .end();
    }
  } catch {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
    });
  }
  /*if (req.params.id == "filterDate") {
    const date = req.query.datefilter.split("-");
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
        return res.json({ success: true, amount: orders.length, orders });
      }
    );
  }
  if(req.params.id == "filterName"){
    console.log();
    // const Name = await Order.find({user: {name : req.query.name}})
    // return res.json(Name)
  }
  else {
    await Order.findOne({ _id: req.params.id }, async (err, find) => {
      if (err) return res.json({ success: false, error: err });
      console.log(find.user, find.packages);
      const userData = await User.findById(
        { _id: find.user },
        { _id: 1, name: 1, phoneNumber: 1, addressDelivery: 1 }
      ).exec();
      const packagesData = await Package.findById(
        { _id: find.packages[0] },
        { _id: 1, name: 1 }
      );
      return res.json({ success: true, userData, packagesData });
    });
  }*/
});

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


router.put("/:id", async (req, res) => {
  //update status 
  try {
    // Find document by id and updates with the required fields
    const result = await Order.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true, // return the new result instead of the old one
        runValidators: true,
      }
    ).exec();

    return res.status(200).json({
      success: true,
      result,
      message: "we update this document by this id: " + req.params.id,
    });
  } catch (err) {
    // If err is thrown by Mongoose due to required validations
    if (err.name == "ValidationError") {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Required fields are not supplied",
      });
    } else {
      // Server Error
      return res.status(500).json({
        success: false,
        result: null,
        message: "Oops there is an Error",
      });
    }
  }
});


module.exports = router;
