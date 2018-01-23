var menuItem = require("../models/menu_item");

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/porkStore');
var items = 
[
    // SANDWICHES
    new menuItem({
        name:'BBQ Pulled Pork Sandwich',
        itemCategory:'Sandwich',
        options: [{title: 'Sandwich Only', price: 6},{title: 'Combo', price: 8.50}],
        imgURL:'../images/food/ppSandwich.png'
    }),
    new menuItem({
        name:'Grilled Pimento Cheese Sandwich',
        itemCategory:'Sandwich',
        options: [{title: 'Sandwich Only', price: 6},{title: 'Combo', price: 8.50}],
        imgURL:'https://imgur.com/19GABs4'
    }),

    // SALADS
    new menuItem({
        name:'House Salad',
        itemCategory:'Salad',
        description:'with Mixed Greens, Cherry Tomatoes, Cucumbers, Red Onion, Feta Cheese, and our Signature Parmesan Cheese Crisp',
        options: [{title: 'Small', price: 4},{title: 'Large', price: 7}],
        imgURL:'https://imgur.com/bbqS6lW'
        
    }),
    new menuItem({
        name:'Warm Goat Cheese Salad',
        itemCategory:'Salad',
        description:'features a warm Goat Cheese Patty, encrusted in chopped Pecans, served over Mixed Greens, Red Onion, Cucumber, Tomatoes, Pecan Halves and topped with our Signature Parmesan Cheese Crisp. Served with our house made Raspberry Vinaigrette.',
        options: [{title: ' ', price: 9}],
        imgURL:'https://imgur.com/XOexcPo'
    }),

    // STARTERS
    new menuItem({
        name:'Fried Cheese Poppers',
        itemCategory:'Starters',
        description:'House Made Pimento Cheese, Goat Cheese and Fresh Mozzarella Cheese balls, fried and served with a Mixed Berry Compote.',
        options: [{title: ' ', price: 12}],
        imgURL:'http://via.placeholder.com/200x150'
    }),
    new menuItem({
        name:'Flash Fried Oysters',
        itemCategory:'Starters',
        description:'Served with our Lemon Aioli Sauce',
        options: [{title: ' ', price: 12}],
        imgURL:'http://via.placeholder.com/200x150'
    }),
    new menuItem({
        name:'BBQ & Pimento Cheese Quesadilla',
        itemCategory:'Starters',
        description:'Served with Roasted Corn, Black Bean & Jalapena Salsa and Sour Cream.',
        options: [{title: ' ', price: 9}],
        imgURL:'https://imgur.com/IskFSYb'
    }),
    new menuItem({
        name:'Wholly Smokin BBQ Nachos',
        itemCategory:'Starters',
        description:'Choice of BBQ Pork, Pulled Chicken or our Smokin Brisket Chili, topped with Roasted Corn, Black Bean & Jalapeno Salsa, and finished with a Wisconsin Cheese Beer Sauce. Served over house fried Tortilla Chips',
        options: [{title: ' ', price: 10}],
        imgURL:'https://imgur.com/ckDz8LT'
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


