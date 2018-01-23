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

   // optionTitle:[String],
   // optionPrice:[Number],

    options: [{title: String,  price: Number}],

    imgURL: {type: String}
  
});

//var MenuItems = module.exports = mongoose.model('menuItems', menu_itemSchema);
var MenuItems = module.exports = mongoose.model('itemTest1', menu_itemSchema);
