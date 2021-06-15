const mongoose = require("mongoose"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs"),
  Admin = require("../model/Admin_model");

exports.register = (req, res) => {
  if (req.body.password.length < 8)
    return res.json({
      success: false,
      message: "Password must be 8 characters",
    });

  const newAdmin = new Admin(req.body);
  newAdmin.hash_password = bcrypt.hashSync(req.body.password, 10);
  newAdmin.save((err, admin) => {
    if (err) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
      });
    } else {
      admin.hash_password = undefined;
      return res.json(admin);
    }
  });
};

exports.login = (req, res) => {
  Admin.findOne(
    {
      email: req.body.email,
    },
    (err, admin) => {
      if (err) throw err;
      if (!admin || !admin.comparePassword(req.body.password)) {
        return res.status(401).json({
          message: "Authentication failed. Invalid Admin or password.",
        });
      }

      return res.json({
        token: jwt.sign(
          { email: admin.email, fullName: admin.fullName, _id: admin._id },
          "RESTFULAPIs"
        ),
      });
    }
  );
};

exports.loginRequired = (req, res, next) => {
  if (req.Admin) {
    next();
  } else {
    return res.status(401).json({ message: "Unauthorized Admin!!" });
  }
};

exports.profile = (req, res) => {
  if (req.Admin) {
    return res.send(req.Admin);
  } else {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.dashboard = (req, res) => {
  Admin.find(
    {},
    { fullName: 1, email: 1, _id: 0, hash_password: 1 },
    (err, data) => {
      res.json({
        success: true,
        data: {
          title: "Admin Dashboard",
          admins: data,
        },
      });
    }
  );
};

exports.forgotPassword = (req, res) => {
  if (req.body.newpassword.length < 8) {
    return res.json({
      success: false,
      message: "Password must be 8 characters",
    });
  }

  Admin.findOne(
    {
      email: req.body.email,
    },
    (err, admin) => {
      if (err) throw err;
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Authentication failed. Invalid Admin.",
        });
      }
      if (admin.comparePassword(req.body.newpassword)) {
        return res.json({
          success: false,
          message: "Newpassword is same as password",
        });
      }
      admin.hash_password = bcrypt.hashSync(req.body.newpassword, 10);
      admin.save();
      return res.json({
        success: true,
        message: "Password changed",
      });
    }
  );
};

exports.delete = (req, res) => {
  //comfirm password for delete admin acount

  Admin.findOne({ email: req.body.email }, (err, admin) => {
    if (err) return res.json({ success: false, error: err });
    if (admin.comparePassword(req.body.confirmPassword)) {
      Admin.findOneAndDelete({ email: req.body.email }, (err, admin) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, message: "Admin is deleted" });
      });
    }
  });
};
