const express = require("express");
const router = express.Router();
const Package = require("../model/Package_model");
require("dotenv/config");

router.get("/", (req, res) => {
  Package.find({}, {}, (err, data) => {
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
  let prepaid_minFee = parseInt(process.env.prepaid_minFee);
  let prepaid_maxFee = parseInt(process.env.prepaid_maxFee);
  let prepaid_minData = parseInt(process.env.prepaid_minData);
  let prepaid_maxData = parseInt(process.env.prepaid_maxData);
  let prepaid_minDuration = parseInt(process.env.prepaid_minDuration);
  let prepaid_maxDuration = parseInt(process.env.prepaid_maxDuration);

  let postpaid_minFee = parseInt(process.env.postpaid_minFee);
  let postpaid_maxFee = parseInt(process.env.postpaid_maxFee);
  let postpaid_minFreeCall = +process.env.postpaid_minFreeCall;
  let postpaid_maxFreeCall = parseInt(process.env.postpaid_maxFreeCall);
  let postpaid_minData = parseInt(process.env.postpaid_minData);
  let postpaid_maxData = parseInt(process.env.postpaid_maxData);
  let postpaid_minSpeed = parseInt(process.env.postpaid_minSpeed);
  let postpaid_maxSpeed = parseInt(process.env.postpaid_maxSpeed);
  let p_range = parseInt(process.env.range);
  //get packages range
  if (req.params.id === "ranges") {
    const ranges = {
      prepaid: {
        minFee: prepaid_minFee,
        maxFee: prepaid_maxFee,
        minData: prepaid_minData,
        maxData: prepaid_maxData,
        minDuration: prepaid_minDuration,
        maxDuration: prepaid_maxDuration,
      },
      postpaid: {
        minFee: postpaid_minFee,
        maxFee: postpaid_maxFee,
        minFreeCall: postpaid_minFreeCall,
        maxFreeCall: postpaid_maxFreeCall,
        minData: postpaid_minData,
        maxData: postpaid_maxData,
        minSpeed: postpaid_minSpeed,
        maxSpeed: postpaid_maxSpeed,
      },
      range: p_range,
    };
    // console.log(ranges);
    return res.json({
      messages: "maxData,maxSpeed 1000 = unlimited",
      ranges,
    });
  }
  //get detail for each package by id
  else if (req.params.id === "detail") {
    Package.findById(
      req.query,
      { moreDetials: 1, detailThai: 1, detailEng: 1 },
      (err, packageDetails) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, packageDetails });
      }
    );
  }
  //filter packages
  else if (req.params.id === "filter") {
    let packageType = req.query.packageType,
      internetType = req.query.internetType,
      internetSpeedType = req.query.internetSpeedType,
      minFee = +req.query.minFee,
      maxFee = +req.query.maxFee,
      minFreeCall = +req.query.minFreeCall,
      maxFreeCall = +req.query.maxFreeCall,
      minData = +req.query.minData,
      maxData = +req.query.maxData,
      minSpeed = +req.query.minSpeed,
      maxSpeed = +req.query.maxSpeed,
      minDuration = +req.query.minDuration,
      maxDuration = +req.query.maxDuration,
      isMNP = req.query.isMNP,
      range = +req.query.range;

    console.log(req.query);
    if (packageType == "") packageType = process.env.packageType;
    if (internetSpeedType == "")
      internetSpeedType = process.env.internetSpeedType;
    if (minFreeCall == "") minFreeCall = postpaid_minFreeCall;
    if (maxFreeCall == "") maxFreeCall = postpaid_maxFreeCall;
    if (minDuration == "") minDuration = prepaid_minDuration;
    if (maxDuration == "") maxDuration = prepaid_maxDuration;
    if (maxData == "") maxData = postpaid_maxData;
    if (isMNP == "") isMNP = process.env.isMNP;
    if (range == "") range = p_range;
    // console.log(isMNP);

    if (packageType === "Post Paid") {
      if (internetType == "") internetType = process.env.postpaid_internetType;
      if (minFee == "") minFee = postpaid_minFee;
      if (maxFee == "") maxFee = postpaid_maxFee;
      if (minData == "") minData = postpaid_minData;

      if (internetSpeedType === "Fixed Speed") {
        if (minSpeed == "") minSpeed = postpaid_minData;
        if (maxSpeed == "") maxSpeed = postpaid_maxData;
        minData = minSpeed;
        maxData = maxSpeed;
      }
      if (!isMNP) {
        console.log("MNP process");
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
          messages: "The resault has " + MNP.length,
          packages: MNP,
        });
      } else {
        console.log("post paid process");
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
            nameThai: 1,
            internet_type: 1,
            price: 1,
            calltime: 1,
            internet_speed: 1,
          },
          (err, package) => {
            if (err)
              return res.json({
                success: false,
                message: "Please select all package detials filter",
                error: err,
              });
            console.log(package.length);
            if (package.length == 0) {
              return res.json({
                success: true,
                messages: "The result is empty",
              });
            }
            return res.json({
              success: true,
              messages: "The result has " + package.length,
              packages: package,
            });
          }
        )
          .sort({ internet_speed: 1, price: 1, name: 1, calltime: -1 })
          .limit(parseInt(range));
      }
    }

    if (packageType === "Pre Paid") {
      if (internetType == "") internetType = process.env.prepaid_internetType;
      if (minFee == "") minFee = prepaid_minFee;
      if (maxFee == "") maxFee = prepaid_maxFee;
      if (minData == "") minData = prepaid_minData;
      console.log("pre paid process");
      //กรณีกรอกข้อมูล เติมเงิน ราคาแพ็คเกจ ปริมาณการใช้อินเทอร์เน็ต
      let package;
      try {
        if (minFee != "" && maxFee != "" && minData != "" && maxData != "") {
          package = await Package.find(
            {
              package_type: packageType,
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
            {
              name: 1,
              internet_type: 1,
              price: 1,
              calltime: 1,
              internet_speed: 1,
            }
          )
            .sort({
              calltime: 1,
              internet_speed: -1,
              price: -1,
              internet_type: 1,
            })
            .limit(range);
        }
        //กรณีอื่นๆ
        else {
          package = await Package.find(
            {
              package_type: packageType,
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
            {
              name: 1,
              internet_type: 1,
              price: 1,
              calltime: 1,
              internet_speed: 1,
            }
          )
            .sort({
              calltime: 1,
              internet_speed: -1,
              price: 1,
            })
            .limit(range);
        }
      } catch (err) {
        return res.json({
          success: false,
          message: "Please select all package detials filter",
          error: err,
        })
      }

      if (package.length == 0) {
        return res.json({
          success: true,
          messages: "The result is empty",
        });
      }
      return res.json({
        success: true,
        messages: "The resault has " + package.length,
        packages: package,
      });
    }
  }
  //filter by id
  else {
    Package.findById({ _id: req.params.id }, {}, (err, package) => {
      if (err) return res.json({ success: false, error: err });
      else {
        return res.json({
          success: true,
          package,
        });
      }
    });
  }
});

router.post("/", async (req, res) => {
  const newpackage = new Package(req.body);
  console.log(newpackage);
  await newpackage.save((err, package) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, message: "package is added", package });
  });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  await Package.findOneAndUpdate(
    { _id: id },
    req.body,
    { new: true },
    (err, updated) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, updated });
    }
  );
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Package.findByIdAndDelete(id, (err, data) => {
    if (err) return res.json({ success: false, error });
    else if (data === undefined || data === null)
      return res.json({ success: false, message: "package is undefined" });
    else return res.json({ success: true, message: "package is deleted" });
  });
});

module.exports = router;
