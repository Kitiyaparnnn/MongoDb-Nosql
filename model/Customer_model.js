const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  birthday: { type: String, required: true },
  nationalId: { type: String, required: true },
  address: {
    houseNo: { type: String, required: true },
    subdistrict: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    postcode: { type: String, required: true },
  },
  addressDelivery: {
    houseNo: { type: String, required: true },
    subdistrict: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    postcode: { type: String, required: true },
  },
  phoneNumber: [{ type: String, required: [true, "What is your contact number?"] }],
  email: { type: String, required: true },
  university: {type: String ,default:''},
  photos: [
    {
      faceImage: { type: Buffer, required: true },
      citizenImage: { type: Buffer, required: true },
      univImage: { type: Buffer },
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
