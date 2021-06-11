const mongoose = require("mongoose");

const OrderData = mongoose.Schema({
  user: {
    name: { type: String, required: true },
    date: { type: String, required: true },
    Idcard: { type: String, required: true },
    address: {
      houseNo: { type: String, required: true },
      subdistrict: { type: String, required: true },
      district: { type: String, required: true },
      postId: { type: String, required: true },
    },
    mobile: { type: Number, required: [true, "What is your contact number?"] },
    email: { type: String, required: true },
    school: {
      name: String,
      faculty: String,
      grade: String,
    },
  },
  package: [{
    package_type: { type: String, required: true },
    name: String,
    internet_type: { type: String, required: true },
    price: { type: Number, required: true },
    calltime: Number,
    internet_speed: { type: Number, required: true }, //GB
    moreDetials: {
      description: String,
      wifi: String,
      morebenefit: String,
    },
  }],
});

module.exports = mongoose.model("Order", OrderData);
