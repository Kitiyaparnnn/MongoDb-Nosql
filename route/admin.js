const adminHandler = require("./admin_controllers");
const express = require("express");
const router = express.Router();

router.post("/register",adminHandler.register)
router.post("/login",adminHandler.login)
router.post("/profile", adminHandler.loginRequired, adminHandler.profile)
router.get("/",adminHandler.dashboard)
router.put("/forgotpassword",adminHandler.forgotPassword)
router.delete("/delete",adminHandler.delete)

module.exports = router;