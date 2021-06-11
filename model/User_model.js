const mongoose = require("mongoose");

const UserData = mongoose.Schema({
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
  photo: [
    {
      user_idcard: { type: Buffer, required: true },
      idcard: { type: Buffer, required: true },
      studentcard: Buffer
    },
  ],
});

module.exports = mongoose.model("User", UserData);
