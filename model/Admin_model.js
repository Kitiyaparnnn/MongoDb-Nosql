const mongoose = require('mongoose'),
  bcrypt = require('bcryptjs'),
  Schema = mongoose.Schema;


const AdminSchema = new Schema({
  fullName: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true
  },
  hash_password: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

AdminSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.hash_password);
};

module.exports =  mongoose.model('Admin', AdminSchema);