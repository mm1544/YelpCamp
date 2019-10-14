// will use an !!express router!!
var express = require("express");
// new instance of Express Router
var router = express.Router();
// now will add all the routes to this "router"
var Campground = require("../models/campground");
// if we "require" a directory(not a file) it will outomaticaly look for "index.js"
var middleware = require("../middleware");


// INDEX - will show all the camp-grounds that we have
router.get("/", function(req, res){

	//Get all campgrounds from DB
	Campground.find({}, function(err, campgroundsFromDB){
		if(err){
			console.log(err);
		} else {
			// 	"req.user" contains username and ID of 
			// CURRENTLY LOGGED USER!!!! So we are
			// !passing! info about the user to the
			// templet 			
			res.render("campgrounds/index", {campgrounds: campgroundsFromDB});
		}
	});
	
	// // 	rendering the template, pass all the data 
	// // that is needed..
	// res.render("campgrounds", {campgrounds: campgrounds});
	
});


// CREATE - add a new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
	
	// 	get dara from form (with req.body.*) and add to campgrounds array ("push" a new campground to array)
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image
	var description = req.body.description;
	
	var author = {
		username: req.user.username, 
		id: req.user._id};
	
    // need to push an object therefore making new object
	var newCampground = {name: name, price: price, image: image, description: description, author: author};
	
// 	"req.user" contains info about currently logged-in user (where from???. Passport maybe loggs-in the user and adds this info).
	// console.log(req.user);
	
	// Saving to DB
	Campground.create(newCampground,
	function(err, newlyCreated){
	if(err){
		req.flash("error", err.message);
		console.log(err);
	} else {
		req.flash("success", "Campground created");
		// console.log(newlyCreated);
			// 	!redirect! back to campgrounds page (to route 
			// "router.get("/campgrounds"...")
		res.redirect("/campgrounds/" + newlyCreated._id); //!!!by default it is redirected as a !GET request!
		}
	});
});



// NEW - !show form! to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});


// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
	//find the campground with provided ID
	// will use !Mongoose's method! FindById().
	// Comments of Campgrounds will be just IDs,
	// referencing to those comments.
	// Need to use ".populate(..)"
	// With ".exec(..) we !execute the query! that
	// we made... Afterwards in "foundCampground"
	// should be "campgrounds" with "coments" 
	// (not just comment IDs).
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground is not found");
			console.log(err);
			res.redirect("/campgrounds");
		} else{
			// console.log(foundCampground);
			//render !show template! with that campground
			// passing our found-campground, so in "show" template we can access passed campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});


// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	
// 	Is user logged in?
	// YES: does user own a campground? 
			// YES: proceed...
			// NO: redirect
	// NO: redirect
//============================
	

	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Something went wrong");
			console.log(err);
			res.redirect("/campgrounds");
			
		}
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});



// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
// 	Find and update the correct campground
// 	"req.body.campground" is the data to update with!!
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			req.flash("error", "Something went wrog");
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// 	Redirect elswhere (show page)
			req.flash("success", "Campground updated successfully");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});


// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			req.flash("error", err.message);
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "Campground deleted successfully");
			res.redirect("/campgrounds");
		}
	});
});


// Exporting "router"
module.exports = router;

