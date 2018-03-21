var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// User Schema
var userSchema = new Schema({
    
    f_Name:{type: String, default: ''},

    l_Name:{type: String, default: ''},

    phoneNum:{type: String, default: ''},

    birthday:{type: String, default: ''},
  
    email:{
        type: String,
        required: true,
        unique: true
    },

    password:{
        type: String,
        required: true
    },

    create_date:{
        type: Date,
        defualt: Date.now(),
    },
    resetPasswordToken: String,

    resetPasswordExpires: Date

});

userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

var User = module.exports = mongoose.model('User', userSchema);
