const express = require("express");
const router = express.Router();
const Package = require("../model/Package_model");

router.get("/", (req, res) => {
  Package.find({}, { moreDetials: 0 }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    else {
      // const PostPaid = new Package([]);
      // Package.find({},(err, result) => {
      //   if(err) return res.json({ success: false, error: err })
      //   return res.json({result})
      // })
      return res.json({ success: true, message: data.length, PostPaid });
    }
  });
});

router.post("/", (req, res) => {
  const {
    package_type,
    name,
    internet_type,
    price,
    calltime,
    internet_speed,
    moreDetials,
  } = req.body;
  if (
    package_type.length === 0 ||
    name.length === 0 ||
    internet_type.length === 0 ||
    price === null ||
    calltime === null ||
    internet_speed === null
  ) {
    return res.json({ success: false, error: "Invalid Input" });
  }
  let data = new Package();
  data.package_type = package_type;
  data.name = name;
  data.internet_type = internet_type;
  data.price = price;
  data.calltime = calltime;
  data.internet_speed = internet_speed;
  data.moreDetials.description = moreDetials.description;
  data.moreDetials.description = moreDetials.description;
  data.moreDetials.wifi = moreDetials.wifi;
  data.moreDetials.morebenefit = moreDetials.morebenefit;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

router.put("/:id", (req, res) => {
  const {
    package_type,
    name,
    internet_type,
    price,
    calltime,
    internet_speed,
    moreDetials,
  } = req.body;

  Package.findByIdAndUpdate(
    req.params.id,
    {
      package_type,
      name,
      internet_type,
      price,
      calltime,
      internet_speed,
      moreDetials,
    },
    (err) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true });
    }
  );
});

//ดักแยกเคส รายเดือน ทุกอัน กับเติมเงิน
router.get("/specific", (req, res) => {
  const {
    package_type,
    internet_type,
    pricemin,
    pricemax,
    calltimemin,
    calltimemax,
    internet_speed,
  } = req.body;

  Package.find(
    {
      package_type: package_type,
      internet_type: internet_type,
      price: { $gte: pricemin, $lte: pricemax },
      calltime: { $gte: calltimemin, $lte: calltimemax },
      internet_speed: { $gte: internet_speed },
    },
    { name: 1, internet_type: 1, price: 1, calltime: 1, internet_speed: 1 },
    (err, data) => {
      if (err) return res.json({ success: false, error: err });
      else return res.json({ success: true, messages: data.length, data });
    }
  ).sort({ price: 1, calltime: 1, internet_speed: 1 });
});

module.exports = router;
