// all middleware goes here

var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};


 
middlewareObj.checkCampgroundOwnership = function(req, res, next){
	// Is user logged in?
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				console.log(err);
				req.flash("error", "Campground not found");
				// "back" redirects to the same location where user currently is
				res.redirect("/campgrounds");
			}else {
				// Does the user owns the campground
					// req.user._id => is a string
					// foundCampground.author.id => is a Mongoose object
					// needt to use .equals() method to compare
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash("error", "You don't have permission to do that");
					res.redirect("/campgrounds/" + req.params.id);
				}	
			}
		});	
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("/campgrounds");
	}
}



middlewareObj.checkCommentOwnership = function(req, res, next){
	// Is user logged in?
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found");
				// "back" redirects to the same location where user currently is
				res.redirect("/campgrounds");
			}else {
				// Does the user owns the comment?
								if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash("error", "You don't have permission to do that");
					res.redirect("/campgrounds/" + req.params.id);
				}	
			}
		});	
	} else {
		req.flash("error", "You need to be ligged-in to do that");
		res.redirect("/campgrounds");
	}
}



middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
// 	will be using "success" and "error" - for dif. color
// 	This line will NOT display anything, it just gives
//  acapability/the access on the next request...
// 	We need to handle it in "/login" - next route..
// 	...Passing the key - "error" and a value - "Please..."
	req.flash("error", "You need to be logged in to do that");
	res.redirect("/login");
}




module.exports = middlewareObj;