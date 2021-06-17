const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  Idcard: { type: String, required: true },
  address: {
    houseNo: { type: String, required: true },
    subdistrict: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    zipcode: { type: Number, required: true },
  },
  mobile: { type: Number, required: [true, "What is your contact number?"] },
  email: { type: String, required: true },
  school: {
    name: {type: String ,default:''},
    faculty: {type: String ,default:''},
    grade: {type: String ,default:''},
  },
  photo: [
    {
      user_idcard: { type: Buffer, required: true },
      idcard: { type: Buffer, required: true },
      studentcard: {type: Buffer},
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
