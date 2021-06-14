const mongoose = require("mongoose");
const UserData = require("./User_model");
const PackagesData = require("./Package_model");

//array shopping 
const OrdersData = mongoose.Schema({
  
      user: UserData,
      package: [PackagesData],

});

module.exports = mongoose.model("Order", OrderData);
