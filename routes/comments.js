// will use an !!express router!!
var express = require("express");
// new instance of Express Router
// now will add all the routes to this "router"
//!!! you need to set mergeParams: true on the router,
//!!! if you want to access params from the !parent! router
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");



// =================
//  COMMENTS ROUTES
//  ================

// NEW Comments
// When request "/campgrounds/:id/comments/new" is made:
// FIRST: middleware "isLoggedIn" is runned
// Then if the user is looged in, the function next()
// is called, which is running callback func.
router.get("/new", middleware.isLoggedIn, function(req, res){
	// find campground by id
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
		}else 
		{
			// testing possibility, after login to come back to the same campground
			// res.locals.currentCampground = foundCampground;
			// console.log(res.locals);
			console.log(foundCampground);
			res.render("comments/new", {campground: foundCampground});
		}
	});
});

// CREATE Comments
// SAFETY concern. In route 
// "router.get("/campgrounds/:id/comments/new",
// isLoggedIn..." we are hiding the form rom the 
// user... But we still can send a POST request eg. 
// with a Postman... 
// SO we need to protect this request!!! Therefore 
// we need to add "isLoggedIn" in here!!!
router.post("/", middleware.isLoggedIn, function(req,res){
	// lookup campground using ID
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function(err, newComment){
				if(err){
					req.flash("error", "Something went wrong");
					console.log(err);
				} else{
// 					Add username and ID to comment
					newComment.author.id = req.user._id;
					newComment.author.username = req.user.username;
// 					Save comment
					newComment.save();
					//console.log(newComment);
					
//					Add comment to the campground
					foundCampground.comments.push(newComment);
					foundCampground.save();
					
					req.flash("success", "Comment is successfully created");
					//redirect
					res.redirect("/campgrounds/" + foundCampground._id);
				}
			});		
		}
	});
});


// COMMENTS EDIT route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	// 	prevents crashing, caused by typing in wrong campground id
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground) {
			req.flash("error", "No campground found");
			return res.redirect("back");
		}
		
		Comment.findById(req.params.comment_id, function(err,foundComment){
			if(err){
				res.redirect("back");
			} else {
				// 	"req.params.id" here "id" referes to campground id, and "comment_id" referes to comment id.
				res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
			}
		});	
	});
});


//  COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
// 	"req.body.comment" is the data to update with
// 	"..comment.text" because in comments/edit.ejs 
//  we have "name="comment[text]""!!!
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		 if(err){
			 res.redirect("back");
		 } else {
			 req.flash("success", "Comment is updated successfully");
// 			 Send to the campground Show page
			 res.redirect("/campgrounds/" + req.params.id);
		 }
	});
});


// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
// 	findByIdAndRemove
		Comment.findByIdAndRemove(req.params.comment_id, function(err){
			if(err){
				res.redirect("back");
			} else {
				req.flash("success", "Comment deleted");
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
});



// Exporting "router"
module.exports = router;