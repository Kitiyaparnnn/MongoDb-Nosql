const adminHandler = require("./admin_controllers");
const express = require("express");
const router = express.Router();

router.post("/register",adminHandler.register)
router.post("/login",adminHandler.login)
router.post("/profile", adminHandler.loginRequired, adminHandler.profile)
router.put("/forgotpassword",adminHandler.forgotPassword)
router.put("/:id",adminHandler.update)
router.delete("/:id",adminHandler.delete)
router.get("/",adminHandler.alladmins)
router.get("/:id",adminHandler.findbyid)

module.exports = router;

//header : header@test.com 123456789