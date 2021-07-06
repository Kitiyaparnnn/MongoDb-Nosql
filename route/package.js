const express = require("express");
const router = express.Router();
const Package = require("../model/Package_model");

router.get("/", (req, res) => {
  Package.find({}, { moreDetials: 0 }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    else {
      return res.json({
        success: true,
        data,
      });
    }
  });
});

router.get("/:id", async (req, res) => {
  if (req.params.id === "ranges") {
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
  } else if (req.params.id === "filter") {
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
      range,
    } = req.params;

    if (packageType == undefined) packageType = "Post Paid";
    if (internetSpeedType == undefined) internetSpeedType = "Full Speed";
    if (minFreeCall == undefined) minFreeCall = 0;
    if (maxFreeCall == undefined) maxFreeCall = 800;
    if (minDuration == undefined) minDuration = 1;
    if (maxDuration == undefined) maxDuration = 60;
    if (maxData == undefined) maxData = 1000;
    if (isMNP == undefined) isMNP = false;

    if (packageType === "Post Paid") {
      if (internetType == undefined) internetType = "5G";
      if (minFee == undefined) minFee = 250;
      if (maxFee == undefined) maxFee = 1400;
      if (minData == undefined) minData = 1.5;

      if (internetSpeedType === "Fixed Speed") {
        if (minSpeed == undefined) minSpeed = 1.5;
        if (maxSpeed == undefined) maxSpeed = 1000;
        minData = minSpeed;
        maxData = maxSpeed;
      }
      if (isMNP) {
        const MNP = await Package.find(
          { name: /(MNP)/i },
          {
            name: 1,
            internet_type: 1,
            price: 1,
            calltime: 1,
            internet_speed: 1,
          }
        ).sort({ price: 1 });
        return res.json({
          success: true,
          messages: "bestlist has " + MNP.length,
          packages: MNP,
        });
      } else {
        await Package.find(
          {
            package_type: packageType,
            internet_type: internetType,
            price: { $gte: minFee, $lte: maxFee },
            calltime: {
              $gte: minFreeCall,
              $lte: maxFreeCall,
            },
            internet_speed: {
              $gte: minData,
              $lte: maxData,
            },
          },
          {
            name: 1,
            internet_type: 1,
            price: 1,
            calltime: 1,
            internet_speed: 1,
          },
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
              packages: data,
            });
          }
        )
          .sort({ internet_speed: 1, price: 1, name: 1, calltime: -1 })
          .limit(range);
      }
    }

    if (packageType === "Pre Paid") {
      if (internetType == undefined) internetType = "4G";
      if (minFee == undefined) minFee = 19;
      if (maxFee == undefined) maxFee = 600;
      if (minData == undefined) minData = 1;

      await Package.find(
        {
          package_type: packageType,
          internet_type: internetType,
          price: { $gte: minFee, $lte: maxFee },
          calltime: {
            $gte: minDuration,
            $lte: maxDuration,
          },
          internet_speed: {
            $gte: minData,
            $lte: maxData,
          },
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
        .limit(range);
    }
  } else {
    Package.findById(
      { _id: req.params.id },
      { moreDetials: 0 },
      (err, package) => {
        if (err) return res.json({ success: false, error: err });
        else {
          return res.json({
            success: true,
            package,
          });
        }
      }
    );
  }
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

module.exports = router;
