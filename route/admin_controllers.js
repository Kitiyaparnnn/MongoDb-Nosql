require("dotenv/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../model/Admin_model");
// const process.env.SECRET_KEY = 'RESTFULAPIs'

exports.register = async (req, res) => {
  //input fullname,emal,password
  if (req.body.password.length < 8)
    return res.json({
      success: false,
      message: "Password must be more than 8 characters",
    });

  const newAdmin = new Admin(req.body);
  newAdmin.hash_password = bcrypt.hashSync(req.body.password, 10);
  await Admin.countDocuments((err, count) => {
    if (count == 0) return (newAdmin.appointment = 1);
    else return;
  });

  await newAdmin.save((err, admin) => {
    if (err) {
      return res.status(400).send({
        success: false,
        message: "Email already exists",
        error: err,
      });
    } else {
      admin.hash_password = undefined;
      return res.json({ message: "Register success", admin });
    }
  });
};

exports.login = async (req, res) => {
  //input email & password
  await Admin.findOne(
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
        message: "Login success",
        token: jwt.sign(
          { email: admin.email, fullName: admin.fullName, _id: admin._id },
          process.env.SECRET_KEY
        ),
      });
    }
  );
};

exports.loginRequired = (req, res, next) => {
  if (req.headers && req.headers.authorization) {
    jwt.verify(
      req.headers.authorization,
      process.env.SECRET_KEY,
      (err, decode) => {
        if (err) req.Admin = undefined;
        req.Admin = decode;
        next();
      }
    );
  } else {
    req.Admin = undefined;
    next();
  }
};

exports.profile = async (req, res) => {
  //inputheader Authentication=token
  //show admin acount w/ password
  if (req.Admin) {
    return await res.send(req.Admin);
  } else {
    return res.status(401).json({ message: "Invalid token" });
  }
};

exports.alladmins = async (req, res) => {
  //get all admin

  await Admin.find({}, {}, (err, data) => {
    res.json({
      success: true,
      data: {
        title: "Admin Dashboard",
        admins: data,
      },
    });
  });
};

exports.findbyid = async (req, res) => {
  await Admin.findById(
    { _id: req.params.id },
    { fullName: 1, email: 1, _id: 0, hash_password: 1 },
    (err, admin) => {
      res.json({
        success: true,
        admin,
      });
    }
  );
};

exports.forgotPassword = async (req, res) => {
  //input email
  //input newpassword
  //input headerpssword
  if (req.body.newpassword.length < 8) {
    return res.json({
      success: false,
      message: "Password must be 8 characters",
    });
  }
  await Admin.find({ appointment: 1 }, async (err, headerAdmin) => {
    if (err) res.json({ success: false, error: err });

    if (headerAdmin[0].comparePassword(req.body.headerpassword)) {
      // console.log(headerAdmin[0]);

      await Admin.findOne(
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
              message: "Newpassword is same as old password",
            });
          }
          admin.hash_password = bcrypt.hashSync(req.body.newpassword, 10);
          admin.created = new Date();
          admin.save();
          return res.json({
            success: true,
            message: "Password changed",
          });
        }
      );
    } else {
      return res.json({ success: false, message: "Header Admin is invalid" });
    }
  });
};

exports.delete = async (req, res) => {
  /*await Admin.findOne({ email: req.body.email }, (err, admin) => {
    if (err) return res.json({ success: false, error: err });
    if (admin.comparePassword(req.body.confirmPassword)) {
    }
  });
  */
  await Admin.findOneAndDelete({ 
    _id: req.params.id }, (err, admin) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, message: "Admin is deleted" });
  });
};

exports.update = async (req, res) => {
  await Admin.findOneAndUpdate({_id: req.params.id},req.body,{new:true},(err, admin) => {
    if(err) return res.json({ success: false, error: err })
    admin.created = new Date();
    admin.save()
    return res.json({ success:true, message:"Update successfully",newadmin:admin})
  })
}