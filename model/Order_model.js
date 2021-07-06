const mongoose = require("mongoose");
const UserData = require("./User_model");
const PackagesData = require("./Package_model");

//array shopping
const OrdersSchema = mongoose.Schema({
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
},{collection: 'orders'});

module.exports = mongoose.model("Order", OrdersSchema);
