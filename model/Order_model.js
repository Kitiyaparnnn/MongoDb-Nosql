const mongoose = require("mongoose");
const UserData = require("./User_model");
const PackagesData = require("./Package_model");

//array shopping
const OrdersSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: " UserData" },
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "PackagesData" }],
});

module.exports = mongoose.model("Order", OrdersSchema);
