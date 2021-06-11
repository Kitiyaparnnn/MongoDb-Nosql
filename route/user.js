const express = require("express");
const router = express.Router();
const User = require("../model/User_model");

router.get("/", (req, res) => {
    User.find((err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data });
      });
})

router.get("/:id", (req, res) => {
    const {id} = req.params;
    User.findById(id,(err,data) => {
        if(err) return res.json({ success: false, error: err })
        return res.json({ success:true,data})
    })
})



module.exports = router;