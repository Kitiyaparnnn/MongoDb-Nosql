const mongoose = require('mongoose')

const PackagesData = mongoose.Schema({
    package_type: {type: String, required:true,default: 'Post Paid'},
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

//limit price 49-2000

//Post Paid
//limit calltime 0-800 min
//limit internet_speed 1.5-unlimited(value = 100) Gb

//Pre Paid
//calltime 0.5-0.9 THB/min
//internet_speed 0.5-2 THB/MB



module.exports = mongoose.model('Package',PackagesData)