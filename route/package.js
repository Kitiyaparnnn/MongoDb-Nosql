const express = require("express");
const router = express.Router();
const Package = require("../model/Package_model");

router.get("/all", (req, res) => {
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
  let {
    packageType,
    internetType,
    internetSpeedType,
    minFee,
    maxFee,
    minFreeCall,
    maxFreeCall,
    minData,
    maxData,
    minSpeed,
    maxSpeed,
    minDuration,
    maxDuration,
    isMNP,
  } = req.body;

  if (packageType === "Post Paid") {
    if (internetSpeedType === "Fixed Speed") {
      minData = minSpeed;
      maxData = maxSpeed;
    }
    if (isMNP) {
      const MNP = await Package.find({ name: /(MNP)/i },{ name: 1, internet_type: 1, price: 1, calltime: 1, internet_speed: 1 },).sort({ price: 1 });
      return res.json({ success: true,
        messages: "bestlist has " + MNP.length,
        packages : MNP});
    } else {
      await Package.find(
        {
          package_type: packageType,
          // internet_type: internetType,
          name:{$nin:/MNP/},
          price: { $gte: minFee, $lte: maxFee },
          calltime: { $gte: minFreeCall, $lte: maxFreeCall },
          internet_speed: { $gte: minData, $lte: maxData },
        },
        { name: 1, internet_type: 1, price: 1, calltime: 1, internet_speed: 1 },
        (err, data) => {
          if (err)
            return res.json({
              success: false,
              message: "Please select all package option",
              error: err,
            });
          else {
          }
          return res.json({
            success: true,
            messages: "bestlist has " + data.length,
            packages : data,
          });
        }
      )
        .sort({ internet_speed: 1,price: 1,name:1, calltime: -1 })
        .limit(3);
    }
  }

  if (packageType === "Pre Paid") {
    await Package.find(
      {
        package_type: packageType,
        // internet_type: internetType,
        price: { $gte: minFee, $lte: maxFee },
        calltime: { $gte: minDuration, $lte: maxDuration },
        internet_speed: { $gte: minData, $lte: maxData },
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
           packages: data,
          });
      }
    )
      .sort({ calltime: 1, internet_speed: -1, price: -1 })
      .limit(3);
  }
});

router.get("/filter", async (req, res) => {
  let {
    packageType,
    internetType,
    internetSpeedType,
    minFee,
    maxFee,
    minFreeCall,
    maxFreeCall,
    minData,
    maxData,
    minSpeed,
    maxSpeed,
    minDuration,
    maxDuration,
    isMNP,
  } = req.body;

  if (packageType === "Post Paid") {
    if (internetSpeedType === "Fixed Speed") {
      minData = minSpeed;
      maxData = maxSpeed;
    }
    if (isMNP) {
      const MNP = await Package.find({ name: /(MNP)/i },{ name: 1, internet_type: 1, price: 1, calltime: 1, internet_speed: 1 },).sort({ price: 1 });
      return res.json({ success: true,
        messages: "bestlist has " + MNP.length,
        packages : MNP});
    } else {
      await Package.find(
        {
          package_type: packageType,
          internet_type: internetType,
          price: { $gte: minFee, $lte: maxFee },
          calltime: { $gte: minFreeCall, $lte: maxFreeCall },
          internet_speed: { $gte: minData, $lte: maxData },
        },
        { name: 1, internet_type: 1, price: 1, calltime: 1, internet_speed: 1 },
        (err, data) => {
          if (err)
            return res.json({
              success: false,
              message: "Please select all package option",
              error: err,
            });
          else {
          }
          return res.json({
            success: true,
            messages: "bestlist has " + data.length,
            packages : data,
          });
        }
      )
        .sort({ internet_speed: 1,price: 1,name:1, calltime: -1 })
    }
  }

  if (packageType === "Pre Paid") {
    await Package.find(
      {
        package_type: packageType,
        internet_type: internetType,
        price: { $gte: minFee, $lte: maxFee },
        calltime: { $gte: minDuration, $lte: maxDuration },
        internet_speed: { $gte: minData, $lte: maxData },
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
           packages: data,
          });
      }
    )
      .sort({ calltime: 1, internet_speed: -1, price: -1 })
  }
});

router.get("/ranges", (req, res) => {
  const ranges = {
    prepaid: {
      minFee: 19,
      maxFee: 600,
      minData: 1,
      maxData: 1000,
      minDuration: 1,
      maxDuration: 60,
    },
    postpaid: {
      minFee: 250,
      maxFee: 1400,
      minFreeCall: 0,
      maxFreeCall: 800,
      minData: 1.5,
      maxData: 1000,
      minSpeed: 1.5,
      maxSpeed: 1000,
    },
  };

  return res.json({
    messages: "maxData,maxSpeed 1000 = unlimited",
    ranges,
  });
});

module.exports = router;
