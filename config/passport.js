var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;


// Serializing (writting) the User Data to the User Session
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    })
});

// Sign-Up Strategy to Create a New User
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},function(req, email, password, done){
    var fName = req.body.fName;
    var lName = req.body.lName;
    var bday = req.body.bday;
    var phoneNumber = req.body.phoneNumber;
    var createDate = Date.now; 
    
    // Validating User input Email and Password using Express-Validator
    req.checkBody('fName', 'First Name is required').notEmpty();
    req.checkBody('lName', 'First Name is required').notEmpty();
    req.checkBody('phoneNumber', 'Phone Number is required and must have 10 digits').notEmpty().isLength({min: 10, max: 10});
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid email').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(error){
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    // Phone Number formatting AFTER validation
    var tempPhoneNum = phoneNumber.toString();
    phoneNumber = "(" + tempPhoneNum.substr(0,3) + ") " + tempPhoneNum.substr(3,3) + "-" + tempPhoneNum.substr(6,4);
   

    User.findOne({'email': email}, function(err, user){
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, {message: 'Email is already in use.'});
        }
        var newUser = new User();
        newUser.f_Name = fName;
        newUser.l_Name = lName;
        newUser.birthday = bday;
        newUser.phoneNum = phoneNumber;
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.createDate = createDate;
        newUser.save(function(err, result){
            if(err){
                return done(err);
            }
            return done(null, newUser);
        });
    })
}));


// Sign-In Strategy 
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
    
}, function(req, email, password, done){
         // Validating User input Email and Password using Express-Validator
        
        req.checkBody('email', 'Invalid email').notEmpty().isEmail();
        req.checkBody('password', 'Invalid password').notEmpty();
        var errors = req.validationErrors();
        if(errors){
            var messages = [];
            errors.forEach(function(error){
                messages.push(error.msg);
            });
            return done(null, false, req.flash('error', messages));
        }
       
        User.findOne({'email': email}, function(err, user){
            if(err){
                return done(err);
            }
            if(!user){
                return done(null, false, {message: 'No user found.'});
            }
            if(!user.validPassword(password)){
                return done(null, false, {message: 'Wrong password.'});
            }
            return done(null, user);
        })
}));