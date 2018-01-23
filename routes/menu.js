var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var MenuItem = require('../models/menu_item');


router.get('/Category/Home', function(req, res, next) {
    res.render('dineInHome', {title: 'Wholly Smokin-Menu', layout: 'nLogMenuLayout', extname: '.hbs'});
});

/********************
 *  SHOPPING ROUTES *
 ********************/

 router.get('/object', function(req, res, next){
  var productId = req.params.id;

  MenuItem.findById(productId, function(err, menu_item){
    if(err) {
      return res.redirect('/');
    }
    res.render('itemView', {title: 'Wholly Smokin-Menu',items: menu_item, layout: 'nLogMenuLayout', extname: '.hbs'});    
  });
 });

router.get('/add-to-cart/:id', function(req, res, next){
  var productId = req.params.id;
  var productCat = req.params.itemCategory;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  MenuItem.findById(productId, function(err, menu_item){

    if(err) {
      return res.redirect('/Menu/Category/Home');
    }
    cart.add(menu_item, menu_item.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/Menu/Category/'+menu_item.itemCategory);
  });
});

router.get('/reduce/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/Shopping-Cart');
});

router.get('/remove/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/Shopping-Cart');
});

module.exports = router;

/**
 * SECURITY: Checks to see if the User is Logged In  
 * 
 * This function is called whenever a /Members/ page is
 *  requested 
 */
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
/**
 * SECURITY: Checks to see if the User is not Logged In  
 * 
 * This function is called whenever a /Members/ page is
 *  requested 
 */
function notLoggedIn(req, res, next){
  if(!req.isAuthenticated()){
    return next();
  }
  res.redirect('/Member/Home');
}