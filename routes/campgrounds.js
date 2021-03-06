// will use an !!express router!!
var express = require("express");
// new instance of Express Router
var router = express.Router();
// now will add all the routes to this "router"
var Campground = require("../models/campground");
// if we "require" a directory(not a file) it will outomaticaly look for "index.js"
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');

// var request = require("request");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
	//   whenever the file gets uploaded, we are creating
	//  custom name for that file. Name will contain: current time stamp plus
	//  the original file name
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dxnvvhvaj', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


 
var options = {
  provider: 'google',
  httpAdapter: 'https',
//   accesses environmental var
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX - will show all the campgrounds that we have
router.get("/", function(req, res){
	if(req.query.search){
		// Will search through all the campgrounds and will return
		// campgrounds, that match the query string.

		// regular expression
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// searching through the campground names
		Campground.find({name: regex}, function(err, campgroundsFromDB){
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

	} else {
		//Get all campgrounds from DB
		Campground.find({}, function(err, campgroundsFromDB){
			if(err){
				console.log(err);
			} else {
				// 	"req.user" contains username and ID of 
				// CURRENTLY LOGGED USER!!!! So we are
				// !passing! info about the user to the
				// templet 			
				res.render("campgrounds/index", {campgrounds: campgroundsFromDB, page: 'campgrounds'});
			}
		});
	}
});


// CREATE - add a new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
	// 'image' is upladed by user; it comes from new.ejs, name='image'
	
	// 'req.file' is comming from 'multer' it is a ?file name?
	cloudinary.uploader.upload(req.file.path, function(result) {

		//add cloudinary url for the image to the 
		// campground object under the image property
		req.body.campground.image = result.secure_url;

		//adding the author to campground
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		}
	// });


		// Accesses API and gets Data (coordinates) or Error
		geocoder.geocode(req.body.campground.location, function (err, data){
			if(err || !data.length) { // err or no data
				console.log(err);
				req.flash('error', 'Invalid address');
				return res.redirect('back');
			}

			// var lat = data[0].latitude;
			// var lng = data[0].longitude;
			// var location = data[0].formattedAddress;


			// need to push an object therefore making new object
			// var newCampground = {name: name, price: price, image: image, description: description, author: author, location: location, lat: lat, lng: lng};
		
			// adding latitude
			req.body.campground.lat = data[0].latitude;
			// ... longitude
			req.body.campground.lng = data[0].longitude;
			// ... formated address
			req.body.campground.location = data[0].formattedAddress;
			
			// 	"req.user" contains info about currently logged-in user (where from???. Passport maybe loggs-in the user and adds this info).
			
			// Saving to DB
			Campground.create(req.body.campground,
			function(err, newlyCreated){
			if(err){
				req.flash("error", err.message);
				return res.redirect('back');
			}
			req.flash("success", "Campground created");
			res.redirect("/campgrounds/" + newlyCreated.id); //!!!by default it is redirected as a !GET request
			
			});
		});

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
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
		  req.flash('error', 'Invalid address');
		  return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
	
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

// "fuzzy" search with regular expressions
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


// Exporting "router"
module.exports = router;


