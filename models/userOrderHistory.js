var mongoose = require('mongoose');
var MenuItem = require('../models/menu_item');

// User Schema
var orderHistory = mongoose.Schema({
    
    order_object:[
        {
            itemName:{type: String,required: true },
    
            side:[
                {
                    sideName:{type: String},
                    sidePrice:{type: Number}
                }
            ],
        sauces:[String],
        specialInstruction: {type: String},
        totalItemPrice:{type: float,required: true}  
        }
    ]

});

var History = module.exports = mongoose.model('history', orderHistory);

