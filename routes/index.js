var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Cart = require('../models/cart');
var MenuItem = require('../models/menu_item');
var User = require('../models/user');

var csrfProtection = csrf();
router.use(csrfProtection);


/**********************
 *  GUEST VIEW ROUTES *
 **********************/
//  Landing Page
router.get('/', notLoggedIn, function(req, res, next) {
  res.render('index', {title: 'Wholly Smokin-Home'});
});
// Spirits 
router.get('/Guests/Spirits', notLoggedIn, function(req, res, next){
  res.render('spiritsMenu', {title: 'Wholly Smokin-Spirits', layout: 'nLogInfoLayout', extname: '.hbs'});
  
});
// Events
router.get('/Guests/Events', notLoggedIn, function(req, res, next){
  res.render('wsEvents', {title: 'Wholly Smokin-Events', layout: 'nLogInfoLayout', extname: '.hbs'});
  
});
// About Us
router.get('/Guests/AboutUs', notLoggedIn, function(req, res, next){
  res.render('aboutUs', {title: 'Wholly Smokin-About Us', layout: 'nLogInfoLayout', extname: '.hbs'});
  
});

/****************************
 *  ACCOUNT CREATION ROUTES *
 ****************************/
router.get('/CreateAccount', notLoggedIn, function(req, res, next){
  var messages = req.flash('error');
  res.render('createUser', {title: 'Wholly Smokin-Sign Up', layout: 'nLogInfoLayout', extname: '.hbs',csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/CreateAccount', passport.authenticate('local.signup', {
  successRedirect: '/Member/Profile/',
  failureRedirect: '/CreateAccount',
  failureFlash: true
}));

/**************************
 *  SIGNED-IN VIEW ROUTES *
 **************************/

router.get('/Member/Sign-In', notLoggedIn, function(req, res, next){
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var messages = req.flash('error');
  res.render('signIn', {title: 'Pork Store-Sign In', layout: 'nLogInfoLayout', extname: '.hbs', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
 });


 router.get('/Member/Profile', isLoggedIn, function(req, res, next){
  var messages = req.flash('error');
  console.log(req.session);
  res.render('userProfile', {title: 'Wholly Smokin-User Profile', user: req.user, layout: 'LogInfoLayout', extname: '.hbs'});
 });

 router.post('/Member/Sign-In', passport.authenticate('local.signin', {
  successRedirect: '/Member/Home',
  failureRedirect: '/Member/Sign-In',
  failureFlash: true
 }));

 router.get('/Logout', function(req, res, next){
   req.logout();
   res.redirect('/');
 })
//  Landing Page
router.get('/Member/Home', isLoggedIn, function(req, res, next){
  res.render('index', {title: 'Wholly Smokin-Home', user: req.user, layout: 'LogHomeLayout', extname: '.hbs'});
  
});
// Spirits 
router.get('/Member/Spirits', isLoggedIn, function(req, res, next){
  res.render('spiritsMenu', {title: 'Wholly Smokin-Spirits', user: req.user, layout: 'LogInfoLayout', extname: '.hbs'});
  
});
// Events
router.get('/Member/Events', isLoggedIn, function(req, res, next){
  res.render('wsEvents', {title: 'Wholly Smokin-Events', user: req.user, layout: 'LogInfoLayout', extname: '.hbs'});
  
});
// About Us
router.get('/Member/AboutUs', isLoggedIn, function(req, res, next){
  res.render('aboutUs', {title: 'Wholly Smokin-About Us', user: req.user, layout: 'LogInfoLayout', extname: '.hbs'});
  
});
/**
 *  ALL ROUTES ARE TO BE REDUCED DOWN TO MATCH THE STYLE OF THE ROUTE BELOW
 */

router.get('/Shopping-Cart', function(req, res, next){
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  if(!req.isAuthenticated()){
    res.render('shopping-cart', {title: 'Wholly Smokin-Cart', products: cart.generateArray(), subTotal: cart.subTotal, tax: cart.tax, totalPrice: cart.totalPrice, layout: 'nLogInfoLayout', extname: '.hbs'});
  }
  if(req.isAuthenticated()){
    res.render('shopping-cart', {title: 'Wholly Smokin-Cart', user: req.user, products: cart.generateArray(), subTotal: cart.subTotal, tax: cart.tax, totalPrice: cart.totalPrice, layout: 'LogInfoLayout', extname: '.hbs'});
  }
});

/*********************
 *  MENU VIEW ROUTES *
 *********************/

router.get('/Menu/Home',function(req, res, next){
  if(!req.isAuthenticated()){
    res.render('menuHome', {title: 'Wholly Smokin-Menu', layout: 'nLogMenuLayout', extname: '.hbs'});    
  }
  if(req.isAuthenticated()){
    res.render('menuHome', {title: 'Wholly Smokin-Menu', user: req.user, layout: 'LogMenuLayout', extname: '.hbs'});
  }
});

router.get('/Menu/Category/Home', function(req, res, next) {
  if(!req.isAuthenticated()){
    res.render('dineInHome', {title: 'Wholly Smokin-Menu', layout: 'nLogMenuLayout', extname: '.hbs'});
  }else{
    res.render('dineInHome', {title: 'Wholly Smokin-Menu', user: req.user, layout: 'LogMenuLayout', extname: '.hbs'});
  }
});
/* GET Menu listing. */
router.get('/Menu/Category/Starters', function (req, res, next) {
  MenuItem.find({ itemCategory: 'Starters' }, function (err, docs) {
    // Splitting Menu Items into "chunks" to aid Item Card Population 
    // Designed display three Item Cards per row.
    var itemChunk = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
      itemChunk.push(docs.slice(i, i + chunkSize));
    }
    if (!req.isAuthenticated()) {
      res.render('basicMenu', { title: 'Wholly Smokin-Menu', items: itemChunk, layout: 'nLogMenuLayout', extname: '.hbs' });
    } else {
      res.render('basicMenu', { title: 'Wholly Smokin-Menu', user: req.user, items: itemChunk, layout: 'LogMenuLayout', extname: '.hbs' });
    }
  })
});

router.get('/Menu/Item/:id', function(req, res, next){
  var productId = req.params.id;
  console.log(productId);
  var productCat = req.params.itemCategory;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  MenuItem.findById(productId, function(err, menu_item){
    if(err) {
      return res.redirect('/Menu/Category/Home');
    }
    console.log(menu_item.name);
    if(!req.isAuthenticated()){
      res.render('itemView', {title: 'Wholly Smokin-Customize', item: menu_item, layout: 'nLogMenuLayout', extname: '.hbs'});
    }else{
      res.render('itemView', {title: 'Wholly Smokin-Customize', user: req.user, item: menu_item, layout: 'LogMenuLayout', extname: '.hbs'});
    }
  });
});

router.get('/Menu/Category/Sandwich', function(req, res, next) {
  MenuItem.find({itemCategory:'Sandwich'},function(err, docs){
    // Splitting Menu Items into "chunks" to aid Item Card Population 
    // Designed display three Item Cards per row.
    var itemChunk = [];
    var chunkSize = 3;
    for(var i = 0; i < docs.length; i+= chunkSize){
      itemChunk.push(docs.slice(i,i + chunkSize));
    }
    if(!req.isAuthenticated()){
      res.render('basicMenu', {title: 'Wholly Smokin-Menu', items: itemChunk, layout: 'nLogMenuLayout', extname: '.hbs'});
    }else{
      res.render('basicMenu', {title: 'Wholly Smokin-Menu', user: req.user, items: itemChunk, layout: 'LogMenuLayout', extname: '.hbs'});    
    }
  })
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
