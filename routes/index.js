// will use an !!express router!!
var express = require("express");
// new instance of Express Router
var router = express.Router();
// now will add all the route
var passport = require("passport");
var User = require("../models/user");
 
// "Landing page" is going to be on the root path:
router.get("/", function(req, res){
	res.render("landing");
});


// ============
// AUTH ROUTES
// ============

// Show register form
router.get("/register", function(req, res){
	res.render("register");
});

// Handle sign-up logic
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	// SIGN-UP. Handles registration, instead of storing
	// password it stores hash
	User.register(newUser, req.body.password, function(err, user){
// 		"user" is a newly created user
		if(err){
			req.flash("error", err.message);
			// console.log(err);
			res.render("register");
		}
		// LOGGING-IN. Once user has signed-up it will
		// log-him-in
		passport.authenticate("local")(req, res, function(){
			req.flash("success", user.username + ", wellcome to YelpCamp");
			res.redirect("/campgrounds");
		});
	});
});



// Shows login form
router.get("/login", function(req, res){
	res.render("login");
});



// Handling login logic
// "passport.authenticate("local"...)" is a middleware
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
// 	callback f. doesn't do anything
});



// logout route
router.get("/logout", function(req, res){
	req.logout();
// 	First thing that we are passing is a key, it can be anything..
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});






// Exporting "router"
module.exports = router;
