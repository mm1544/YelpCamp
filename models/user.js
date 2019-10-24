var mongoose = require("mongoose");

// adding passport-local plugin
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatar: String,
	firstName: String,
	lastName: String,
	email: String,
	isAdmin: {type: Boolean, default: false}
});

// adds to UserSchema methods and stuff from 
// "passport-local-mongoose" package
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);