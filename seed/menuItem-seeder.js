var menuItem = require("../models/menu_item");

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/porkStore');
var items = 
[
    new menuItem({
        name:'Ham Sandwich',
        itemCategory:'Sandwich',
        description:'Ham slathered with mustard on two slices of white bread',
        optionAname: "Sandwich Only",
        optionAprice: 6,
        optionBname: "Combo",
        optionBprice: 8
    }),
    new menuItem({
        name:'Turkey Sandwich',
        itemCategory:'Sandwich',
        description:'Turkey slathered with mayo on two slices of white bread',
        optionBname: "Combo",
        optionBprice: 8
    }),
    new menuItem({
        name:'Grilled Cheese',
        itemCategory:'Sandwich',
        description:'You know what this is......',
    }),
    new menuItem({
        name:'Caesar Salad',
        itemCategory:'Salad',
        description:'You know what this is......',
        optionAname: "Large",
        optionAprice: 6,
    }),
    new menuItem({
        name:'Cobb Salad',
        itemCategory:'Salad',
        description:'You know what this is......',
    }),
    new menuItem({
        name:'House Salad',
        itemCategory:'Salad',
        description:'You know what this is......',
    })
];
var done = 0;
for(var i = 0; i < items.length; i++){
    items[i].save(function(err, result){
        done++;
        if(done === items.length){
            exit();
        }
    });
}
function exit(){
    mongoose.disconnect();
}


