const mongoose = require('mongoose')

const PrePaid = mongoose.Schema({
    package_type: {type: String, required:true},
    name: String,
    internet_type: {type: String, required:true},
    price: {type: Number, required:true},
    calltime:Number,
    internet_speed: {type: Number, required:true},//GB,100 is unlimited
    moreDetials:{
        description:[{type:String}],
        wifi:String, 
        morebenefit:[{type:String}]
    }

})

//Pre Paid
//calltime 0.5-0.9 THB/min
//internet_speed 0.5-2 THB/MB

module.exports = mongoose.model('PrePaid', PrePaid)