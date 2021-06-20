const express = require("express");
const router = express.Router();
const Package = require("../model/Package_model");

router.get("/", (req, res) => {
  Package.find({}, { moreDetials: 0 }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    else {
      return res.json({
        success: true,
        message: "all packges is " + data.length,
        data,
      });
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
  let data = new Package(req.body);
  await data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, message: "package is added" });
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

  const { id } = req.params;
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
  return res.json({ success: true, packageUpdate: update });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Package.findByIdAndDelete(id, (err, data) => {
    if (err) return res.json({ success: false, error });
    else if (data === undefined || data === null)
      return res.json({ success: false, message: "There is any package" });
    else return res.json({ success: true, message: "package is deleted" });
  });
});

router.get("/bestlist", async (req, res) => {
  const {
    packageType,
    internetType,
    minprice,
    maxprice,
    minCall,
    maxCall,
    minInternetSpeed,
    maxInternetSpeed,
  } = req.body;

  if (packageType === "Post Paid") {
    await Package.find(
      {
        package_type: packageType,
        // internet_type: internetType,
        price: { $gte: minprice, $lte: maxprice },
        calltime: { $gte: minCall, $lte: maxCall },
        internet_speed: { $gte: minInternetSpeed, $lte: maxInternetSpeed },
      },
      { name: 1, internet_type: 1, price: 1, calltime: 1, internet_speed: 1 },
      (err, data) => {
        if (err)
          return res.json({
            success: false,
            message: "Please select all package option",
            error: err,
          });
        else
          return res.json({
            success: true,
            messages: "bestlist has " + data.length,
            data,
          });
      }
    )
      .sort({ price: 1, calltime: -1, internet_speed: -1 })
      .limit(3);
  }

  if (packageType === "Pre Paid") {
    await Package.find(
      {
        package_type: packageType,
        // internet_type: internetType,
        price: { $gte: minprice, $lte: maxprice },
        calltime: { $gte: minCall, $lte: maxCall },
        internet_speed: { $gte: minInternetSpeed, $lte: maxInternetSpeed },
      },
      { name: 1, internet_type: 1, price: 1, calltime: 1, internet_speed: 1 },
      (err, data) => {
        if (err)
          return res.json({
            success: false,
            message: "Please select all package option",
            error: err,
          });
        else
          return res.json({
            success: true,
            messages: "bestlist has " + data.length,
            data,
          });
      }
    )
      .sort({ calltime: 1, internet_speed: -1, price: -1 })
      .limit(3);
  }
});

router.get("/ranges", (req, res) => {
  const ranges = {
    minPrice: 19,
    maxPrice: 2000,
    minCallAmount: 0,
    maxCallAmount: 800,
    minInternetSpeedAmount: 0.5,
    maxInternetSpeedAmount: 1000,
    // minCallRate: number,
    // maxCallRate: number,
    // minInternetSpeedRate: number,
    // maxInternetSpeedRate: number,
  };
  
  return res.json({

    // ranges
    minPrice: 19,
    maxPrice: 2000,
    minCallAmount: 0,
    maxCallAmount: 800,
    minInternetSpeedAmount: 0.5,
    maxInternetSpeedAmount: 1000,
  });
});

module.exports = router;
