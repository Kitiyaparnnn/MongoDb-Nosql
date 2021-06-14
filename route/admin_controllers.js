'use strict';

const mongoose = require('mongoose'),
  jwt = require('jsonwebtoken'),
  bcrypt = require('bcrypt'),
  Admin = require('../model/Admin_model')

exports.register = function(req, res) {
  const newAdmin = new Admin(req.body);
  newAdmin.hash_password = bcrypt.hashSync(req.body.password, 10);
  newAdmin.save(function(err, Admin) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    } else {
      Admin.hash_password = undefined;
      return res.json(Admin);
    }
  });
};

exports.sign_in = function(req, res) {
  Admin.findOne({
    email: req.body.email
  }, function(err, Admin) {
    if (err) throw err;
    if (!Admin || !Admin.comparePassword(req.body.password)) {
      return res.status(401).json({ message: 'Authentication failed. Invalid Admin or password.' });
    }
    return res.json({ token: jwt.sign({ email: Admin.email, fullName: Admin.fullName, _id: Admin._id }, 'RESTFULAPIs') });
  });
};

exports.loginRequired = function(req, res, next) {
  if (req.Admin) {
    next();
  } else {

    return res.status(401).json({ message: 'Unauthorized Admin!!' });
  }
};
exports.profile = function(req, res, next) {
  if (req.Admin) {
    res.send(req.Admin);
    next();
  } 
  else {
   return res.status(401).json({ message: 'Invalid token' });
  }
};