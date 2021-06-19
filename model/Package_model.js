const mongoose = require('mongoose')

const PackageSchema = mongoose.Schema({
    package_type: {type: String, required:true,default: 'Post Paid'},
    name: String,
    internet_type: {type: String, required:true},
    price: {type: Number, required:true},
    calltime:{type :Number,default:0},//เฉพาะโทรนอกเครือข่าย
    internet_speed: {type: Number, required:true},//GB,1000 is unlimited //call data
    moreDetials:{
        description:[{type:String}],
        wifi:String, 
        morebenefit:[{type:String}]
    }
})


//limit price 19-2000

//Post Paid
//limit calltime 0-800 min
//limit internet_speed 1.5-unlimited(value = 1000) Gb

//Pre Paid
//calltime(day) 1-60
//internet_speed 1-unlimited(value = 1000)



module.exports = mongoose.model('Package',PackageSchema)