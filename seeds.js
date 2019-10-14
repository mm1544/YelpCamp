// In app.js I will require the "seeds.js" file

var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
	{
		name: "Honey Lake Campground",
		image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=60",
		description: "In the Sierra Madre Mountains, just off Highway 395. 70 miles from Reno. Restaurant, lounge and well stocked general store"
	},
	{
		name: "Pine Ridge Park Campsite",
		image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=60",
		description: "Peaceful boreal forest site edged by a salmon river. Near hiking, fishing, kayaking and wildlife in Adirondack Park. Outdoor pool, baseball field, basketball court and lawn games"
	},
	{
		name: "Burro Mountain Homestead",
		image: "https://images.unsplash.com/photo-1533086723868-6060511e4168?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=60",
		description: "Here’s a spot steeped in history: Burro Mountain Homestead has hosted English lords and presidents of the USA while the surrounding New Mexico terrain tells the story of the West, from prehistoric tribes to the wagon trains and the mines."
	}
]

function seedDB(){
	// Remove all campgrounds. 
	// remove() is replaced with deleteMany()
	Campground.deleteMany({}, function(err){
		
		if(err){
			console.log(err);
		} else{
			console.log("removed campgrounds!");

			// add few campgrounds
			data.forEach(function(seed){
				Campground.create(seed, function(err, campground){
					if(err){
						console.log(err)
					}else {
						console.log("Campground added");
						// create a comment
						Comment.create(
							{
								text: "This place is greate but to many mosquitoes",
								author: "Skot"
							}, function(err, comment){
								if(err){
									console.log(err);
								} else {
									console.log("Comment created!");
									campground.comments.push(comment);
									campground.save();	
								}
							});
					}
				});
			});
		}
	});	
}

// exporting FUNCTION
module.exports = seedDB;
