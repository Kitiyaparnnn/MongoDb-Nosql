const express = require("express");
const router = express.Router();
const Package = require("../model/Package_model");

router.get("/", (req, res) => {
  Package.find({}, { moreDetials: 0 }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    else {
      return res.json({ success: true, message: data.length, data });
    }
  });
});

router.post("/", async (req, res) => {
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
  await data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

router.put("/:id", async (req, res) => {
  const {
    package_type,
    name,
    internet_type,
    price,
    calltime,
    internet_speed,
    moreDetials,
  } = req.body;

  const {id} = req.params;
  const update = await Package.findByIdAndUpdate(
   id,
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
    }
  );
  return res.json({ success: true, update });
});

router.delete("/:id", async (req, res) => {
  const {id} = req.params;
  await Package.findByIdAndDelete(id, (err, data) => {
    if (err) return res.json({ success: false, error });
    else if (data === undefined || data === null)
      return res.json({ success: false, message: "There is any package"});
      else return res.json({ success: true });
  });
});

router.get("/bestlist", async (req, res) => {
  const {
    package_type,
    internet_type,
    pricemin,
    pricemax,
    calltimemin,
    calltimemax,
    internet_speed,
  } = req.body;

  await Package.find(
    {
      package_type: package_type,
      internet_type: internet_type,
      price: { $gte: pricemin, $lte: pricemax },
      calltime: { $gte: calltimemin, $lte: calltimemax },
      internet_speed: { $gte: internet_speed },
    },
    { name: 1, internet_type: 1, price: 1, calltime: 1, internet_speed: 1 },
    (err, data) => {
      if (err) return res.json({ success: false,message: 'Please select all package option', error: err });
      else return res.json({ success: true, messages: data.length, data });
    }
  ).sort({ price: 1, calltime: 1, internet_speed: 1 }).limit(3);

});

router.get("/ranges",(req, res) => {
  return res.json({pricemin: 49,pricemax:2000,calltimemin:0,calltimemax:800,internet_speed_min:0.5,internet_speed_max:100})
})

module.exports = router;
