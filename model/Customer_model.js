const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  birthday: { type: String, required: true },
  identifier: { type: String, required: true },
  nationality: { type: String ,default:"Thailand"},
  currentAddress: {
    detail: { type: String, required: true },
    subdistrict: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    postcode: { type: String, required: true },
  },
  deliveryAddress: {
    detail: { type: String, required: true },
    subdistrict: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    postcode: { type: String, required: true },
  },
  phone: [{ type: String, required: [true, "What is your contact number?"] }],
  email: [{ type: String, required: true }],
  institution: { type: String, default: "" },
  image: {
    faceImage: { link: String, data: Object },
    identifierImage: { link: String, data: Object, default: "" },
    studentImage: { link: String, data: Object, default: '' },
  },
});

module.exports = mongoose.model("User", UserSchema);
