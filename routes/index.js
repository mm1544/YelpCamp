// will use an !!express router!!
var express = require("express");
// new instance of Express Router
var router = express.Router();
// now will add all the route
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");


 
// "Landing page" is going to be on the root path:
router.get("/", function(req, res){
	res.render("landing");
});


// ============
// AUTH ROUTES
// ============

// Show register form
router.get("/register", function(req, res){
	res.render("register", {page: 'register'});
});

// Handle sign-up logic
router.post("/register", function(req, res){
	var newUser = new User({
		username: req.body.username, 
		firstName: req.body.firstName, 
		lastName: req.body.lastName,
		email: req.body.email,
		avatar: req.body.avatar
	});
	if(req.body.adminCode === "secret123"){
		newUser.isAdmin = true;
	}
	// SIGN-UP. Handles registration, instead of storing
	// password it stores hash
	User.register(newUser, req.body.password, function(err, user){
// 		"user" is a newly created user
		if(err){
			console.log(err);
			res.render("register", {error: err.message});
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
	res.render("login", {page:'login'});
});



// Handling login logic
// "passport.authenticate("local"...)" is a middleware
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
// 	callback f. doesn't do anything
		console.log(req.user);
});



// logout route
router.get("/logout", function(req, res){
	req.logout();
	console.log("After log-out: " + req.user);
// 	First thing that we are passing is a key, it can be anything..
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});


// User profiles
router.get("/users/:id", function(req, res){
	// "/:id" is accessed/passed by/to req.params.id
	User.findById(req.params.id, function(err, foundUser){
		if(err || !foundUser){
			return res.redirect("/campgrounds");
		}
		Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
			if(err || !campgrounds){
				return res.redirect("/campgrounds");
			}
			res.render("users/show", {user: foundUser, campgrounds: campgrounds});
		});
		
	});
});






// Exporting "router"
module.exports = router;
