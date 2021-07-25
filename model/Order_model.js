const mongoose = require("mongoose");
const UserData = require("./Customer_model");
const PackagesData = require("./Package_model");

//array shopping
const OrdersSchema = mongoose.Schema({
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
  date : {type: Date , default: Date.now},
  status : {type:String , default:'vertify'}
},{collection: 'orders'});

module.exports = mongoose.model("Order", OrdersSchema);

