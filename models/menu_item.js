var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Menu Schema
var menu_itemSchema = Schema({
    
    name:{
        type: String,
        required: true,
        unique: true
    },
    
    itemCategory:{
        type: String,
        required: true
    },

    description:{
        type: String
    },

    price: {type: Number},

    imgURL: {type: String}
  
});

var MenuItems = module.exports = mongoose.model('itemTest2', menu_itemSchema);
