const mongoose = require("mongoose");
const UserData = require("./User_model")
const PackagesData = require('./Package_model')

const OrdersData = mongoose.Schema({
  user: UserData,
  package: PackagesData
});

module.exports = mongoose.model("Order", OrderData);
