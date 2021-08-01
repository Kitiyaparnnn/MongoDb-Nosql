const mongoose = require("mongoose");

//array shopping 
//admin
const OrdersSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
  date : {type: Date , default: Date.now},
  status : {type:String , default:'pending order'},
  admin:{ type: mongoose.Schema.Types.ObjectId, ref: "Admin",default:null}
},{collection: 'orders'});

module.exports = mongoose.model("Order", OrdersSchema);

