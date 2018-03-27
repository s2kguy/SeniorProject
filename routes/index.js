
var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Cart = require('../models/cart');
var MenuItem = require('../models/menu_item');
var User = require('../models/user');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var objectId = require('mongodb').ObjectID;

var csrfProtection = csrf();
router.use(csrfProtection);

/*******************
 *  ACCOUNT ROUTES *
 *******************/
router.get('/CreateAccount', notLoggedIn, function (req, res, next) {
  var messages = req.flash('error');
  res.render('createUser', {
    title: 'Wholly Smokin-Sign Up', layout: 'nLogInfoLayout', extname: '.hbs',
    csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0
  });
});

router.post('/CreateAccount', passport.authenticate('local.signup', {
  successRedirect: '/Member/Profile/',
  failureRedirect: '/CreateAccount',
  failureFlash: true
}));

router.get('/Member/Sign-In', notLoggedIn, function (req, res, next) {
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  var messages = req.flash('error');
  res.render('signIn', { title: 'Pork Store-Sign In', layout: 'nLogInfoLayout', extname: '.hbs', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.get('/Member/Profile', isLoggedIn, function (req, res, next) {
  var messages = req.flash('error');
  res.render('userProfile', { title: 'Wholly Smokin-User Profile', user: req.user, layout: 'LogInfoLayout', extname: '.hbs' });
});

router.post('/Member/Sign-In', passport.authenticate('local.signin', {
  successRedirect: '/Home',
  failureRedirect: '/Member/Sign-In',
  failureFlash: true
}));

router.get('/Delete/:id', isLoggedIn, function(req, res){
  var id = req.params.id;
  console.log(id);

  User.deleteOne({'_id': id}, function(err, blah){
    if(err){
      res.redirect('/');
    }else{
      res.redirect('/Logout');
    }
  });

});

router.get('/Logout', function (req, res, next) {
  req.logout();
  res.redirect('/Home');
});

/****************************
 *  PASSWORD RESET  ROUTES  *
 ****************************/
router.get('/ForgotPassword', notLoggedIn, function (req, res) {
  var messages = req.flash('error');
  console.log(req.session);
  res.render('forgot', {
    title: 'Forgot Password', layout: 'nLogInfoLayout', extname: '.hbs',
    csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0
  });
});

router.post('/ForgotPassword', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/ForgotPassword');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Expires in 1 hour
        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      console.log('Creating SMTP Tranport.');
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'porkstoretestemail@gmail.com',
          pass: '1012321805'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: '<PorkStore> Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      // Send Email
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('error', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err);
      });
    }
  ],
    function (err) {
      if (err) return next(err);
      res.redirect('/ForgotPassword');
    });
});

router.get('/reset/:token', function (req, res, next) {
  var messages = req.flash('error');

  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/ForgotPassword');
    }
    res.render('reset', {
      title: 'Reset Password', layout: 'nLogInfoLayout', extname: '.hbs',
      csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0, 
      user: req.user, resetPasswordToken: req.params.token
    });

  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    
    function (done) {
      User.findOne(
      { 
          resetPasswordToken: req.params.token, 
          resetPasswordExpires: { $gt: Date.now() }
      },
      function (err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/ForgotPassword');
        }
        var _password = req.body.password;
        var _confirmPass = req.body.confirmPassword;

        req.checkBody('password', 'Your password must be at least 8 characters long.')
          .notEmpty().isLength({ min: 3 });
        req.checkBody('confirmPassword', 'Your password must be at least 8 characters long.')
          .notEmpty().isLength({ min: 3 });
        if (req.body.password !== req.body.confirmPassword) {
          req.flash('error', 'Password and Confirm Password Fields do not match.');
          console.log('PWs do not match!');
          return res.redirect('/ForgotPassword');
        }
        user.password = user.encryptPassword(_password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(user, function (err, result) {
          if (err) {
            return done(err);
          }
          return done(null, user);
        });
      });
    },
    function (user, done) {

      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'porkstoretestemail@gmail.com',
          pass: '1012321805'
        }
      });

      var mailOptions = {
        to: user.email,
        from: 'porkstoretestemail@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('error', 'Success! Your password has been changed. Please sign-in with your new password.');
        done(err);
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('/Member/Sign-In');
  });
});

/*router.get('/SendMessage', function (req, res) {
  req.checkBody('name', 'Please enter your name.')
        .notEmpty().isLength({ min: 1 });
 console.log(req.params.name);
 
 /* async.waterfall([
  
    function(req, userEmail){
      console.log('Second Function of the waterfall');
      // Get and Validate Form Values
      var name = req.body.name;
      var email = req.body.email;
      var message = req.body.message;
      req.checkBody('name', 'Please enter your name.')
        .notEmpty().isLength({ min: 1 });
      req.checkBody('email', 'Please enter an email address.')
        .notEmpty().isEmail();
      req.checkBody('message', 'Your message must contain at least 15 characters.')
        .notEmpty().isLength({ min: 15 });
      // Create an Object
      var userEmail = { name: name, email: email, message: message};
      console.log(userEmail);
      return this.userEmail;
   }, 
   function(userEmail, done){
    console.log('Third Function of the waterfall');
      // Initialize the Email Service
      let smtpTransport, mailOptions_Responce, mailOptions_User;
      smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'porkstoretestemail@gmail.com',
          pass: '1012321805'
        }
      });
      console.log('Email Service Initialized\n'+smtpTransport);
      // Create the Email Objects
      mailOptions_Responce = {
        to: req.body.email,
        from: 'porkstoretestemail@gmail.com',
        subject: 'Thank you for your email!',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + req.body.email + ' has just been changed.\n'
      };
      mailOptions_User = {
        to: 'porkstoretestemail@gmail.com',
        from: req.body.email,
        subject: 'A message from ' + req.body.name,
        text: req.body.message
      };
      console.log('Email Objects Created\n'+mailOptions_Responce+'\n'+mailOptions_User);
      // Send the Emails
      smtpTransport.sendMail(mailOptions_Responce, function (err) {
        console.log('Automatic Responce Email Sent');
        req.flash('error', 'Success! Your password has been changed. Please sign-in with your new password.');
        done(err);
      });
      smtpTransport.sendMail(mailOptions_User, function (err) {
        console.log('User Email Sent');
        req.flash('error', 'Success! Your message has been sent.');
        done(err);
      });
    }
  ], function (err) {
      res.redirect('/');
    });
 // console.log('Waterfall complete'); 
 res.redirect('/');
}); */

router.get('/SendMessage', function(req, res, next){
  if (!req.isAuthenticated()) {
    res.render('contactUs', { title: 'Contact Us', layout: 'nLogInfoLayout', extname: '.hbs', csrfToken: req.csrfToken() });
  }
  if (req.isAuthenticated()) {
    res.render('contactUs', { title: 'Contact Us', user: req.user, layout: 'LogInfoLayout', extname: '.hbs', csrfToken: req.csrfToken() });
  }
});
//   User will Click 
router.post('/SendMessage', function(req, res, next){
  async.waterfall([

    function (done) {
      // Get and Validate Form Values
      var name = req.body.name;
      console.log(name);
      var email = req.body.email;
      console.log(email);
      var message = req.body.message;
      console.log(message);

      
      req.checkBody('name', 'Please enter your name.')
        .notEmpty().isLength({ min: 1 });
      req.checkBody('email', 'Please enter an email address.')
        .notEmpty().isEmail();
      req.checkBody('message', 'Your message must contain at least 15 characters.')
        .notEmpty().isLength({ min: 15 });
      // Create an Object to pass
      var userEmail = {name: name, email: email, message: message};
      // Return and Pass the Object
      return done(null, userEmail);
    },
    function (userEmail, done) {
      // Initialize the Email Service
      var smtpTransport, mailOptions_Responce, mailOptions_User;
      smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'porkstoretestemail@gmail.com',
          pass: '1012321805'
        }
      });
      console.log('Email Service Initialized');
      // Create the Email Objects
      mailOptions_Responce = {
        to: userEmail.email,
        from: 'porkstoretestemail@gmail.com',
        subject: 'Thank you for your email!',
        text: 'Hello,\n\n' +
          'We are thankful for your business, and will respond as soon as possible.  Have a great day!.\n'
      };
      mailOptions_User = {
        to: 'porkstoretestemail@gmail.com',
        from: userEmail.email,
        subject: 'A message from ' + String(userEmail.name),
        text: String(userEmail.message)
      };
      console.log('Email Objects Created');
      // Send the Emails
      smtpTransport.sendMail(mailOptions_Responce, function (err) {
        console.log('Automatic Responce Email Sent');
        req.flash('error', 'Success! Your password has been changed. Please sign-in with your new password.');
        done(err);
      });
      smtpTransport.sendMail(mailOptions_User, function (err) {
        console.log('User Email Sent');
        req.flash('error', 'Success! Your message has been sent.');
        done(err);
      });
    }
  ],
  function (err, success) {
    if (err) console.log('something went wrong');
    res.redirect('/Home');
  });
});


/************************
 *  SIGN-IN VIEW ROUTES *
 ************************/



/****************
 *  VIEW ROUTES *
 ****************/
//  Home Page
router.get('/Home', function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('index', { title: 'Wholly Smokin-Home' });
  }
  if (req.isAuthenticated()) {
    res.render('index', { title: 'Wholly Smokin-Home', user: req.user, layout: 'LogHomeLayout', extname: '.hbs' });
  }
});
// Spirits 
router.get('/Spirits', function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('spiritsMenu', { title: 'Wholly Smokin-Spirits', layout: 'nLogInfoLayout', extname: '.hbs' });
  }
  if (req.isAuthenticated()) {
    res.render('spiritsMenu', { title: 'Wholly Smokin-Spirits', user: req.user, layout: 'LogInfoLayout', extname: '.hbs' });
  }
});
// Events
router.get('/Events', function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('wsEvents', { title: 'Wholly Smokin-Events', layout: 'nLogInfoLayout', extname: '.hbs' });
  }
  if (req.isAuthenticated()) {
    res.render('wsEvents', { title: 'Wholly Smokin-Events', user: req.user, layout: 'LogInfoLayout', extname: '.hbs' });
  }
});
// About Us
router.get('/AboutUs', function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('aboutUs', { title: 'Wholly Smokin-About Us', layout: 'nLogInfoLayout', extname: '.hbs' });
  }
  if (req.isAuthenticated()) {
    res.render('aboutUs', { title: 'Wholly Smokin-About Us', user: req.user, layout: 'LogInfoLayout', extname: '.hbs' });
  }
});

/***************************
 *  MENU & SHOPPING ROUTES *
 ***************************/
router.get('/Menu/Home', function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('menuHome', { title: 'Wholly Smokin-Menu', layout: 'nLogMenuLayout', extname: '.hbs' });
  }
  if (req.isAuthenticated()) {
    res.render('menuHome', { title: 'Wholly Smokin-Menu', user: req.user, layout: 'LogMenuLayout', extname: '.hbs' });
  }
});

router.get('/Menu/Category/Home', function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('dineInHome', { title: 'Wholly Smokin-Menu', layout: 'nLogMenuLayout', extname: '.hbs' });
  } else {
    res.render('dineInHome', { title: 'Wholly Smokin-Menu', user: req.user, layout: 'LogMenuLayout', extname: '.hbs' });
  }
});

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
  });
});

router.get('/Menu/Item/:id', function (req, res, next) {
  var productId = req.params.id;
  console.log(productId);
  var productCat = req.params.itemCategory;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  MenuItem.findById(productId, function (err, menu_item) {
    if (err) {
      return res.redirect('/Menu/Category/Home');
    }
    console.log(menu_item.name);
    if (!req.isAuthenticated()) {
      res.render('itemView', { title: 'Wholly Smokin-Customize', item: menu_item, layout: 'nLogMenuLayout', extname: '.hbs' });
    } else {
      res.render('itemView', { title: 'Wholly Smokin-Customize', user: req.user, item: menu_item, layout: 'LogMenuLayout', extname: '.hbs' });
    }
  });
});

router.get('/Menu/Category/Sandwich', function (req, res, next) {
  MenuItem.find({ itemCategory: 'Sandwich' }, function (err, docs) {
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
  });
}); 

router.get('/Shopping-Cart', function (req, res, next) {
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  if (!req.isAuthenticated()) {
    res.render('shopping-cart', { title: 'Wholly Smokin-Cart', products: cart.generateArray(), subTotal: cart.subTotal, tax: cart.tax, totalPrice: cart.totalPrice, layout: 'nLogInfoLayout', extname: '.hbs' });
  }
  if (req.isAuthenticated()) {
    res.render('shopping-cart', { title: 'Wholly Smokin-Cart', user: req.user, products: cart.generateArray(), subTotal: cart.subTotal, tax: cart.tax, totalPrice: cart.totalPrice, layout: 'LogInfoLayout', extname: '.hbs' });
  }
});

router.get('/Checkout', function(req, res, next){
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  if (!req.isAuthenticated()) {
    res.render('checkout', { title: 'Pork Store Checkout', products: cart.generateArray(), subTotal: cart.subTotal, tax: cart.tax, totalPrice: cart.totalPrice, layout: 'nLogInfoLayout', extname: '.hbs' });
  }
  if (req.isAuthenticated()) {
    res.render('checkout', { title: 'Pork Store Checkout', user: req.user, products: cart.generateArray(), subTotal: cart.subTotal, tax: cart.tax, totalPrice: cart.totalPrice, layout: 'LogInfoLayout', extname: '.hbs' });
  }
});

module.exports = router;

/**
 * SECURITY: Checks to see if the User is Logged In  
 * 
 * This function is called whenever a /Members/ page is
 *  requested 
 */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
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
function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/Member/Home');
}
