require('dotenv').config();
//importing express
var express = require("express"),
// "app" variable
	app = express(),
// importing body-parser
	bodyParser = require("body-parser"),
//import mongoose
	mongoose = require("mongoose"),
	flash = require("connect-flash"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	express_session = require('express-session'),
	Comment = require("./models/comment"),
	Campground = require("./models/campground"),
	User = require("./models/user"),
	seedDB = require("./seeds");
	newMoment = require('moment');

var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes			= require("./routes/index");

// For Heroku
// If "process.env.DATABASEURL" is 
// corupt, then we will use a !!backup.
// "process.env.DATABASEURL" is environmental variable equal to 
// "mongodb+srv://mm1544:vQlmeCsumXcN1XVg@cluster0-xn0rp.mongodb.net/test?retryWrites=true&w=majority"
// var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_v12_2";

var url = process.env.DATABASEURL || process.env.LOCAL;

// For local testing
// var url = "mongodb+srv://mm1544:vQlmeCsumXcN1XVg@cluster0-xn0rp.mongodb.net/test?retryWrites=true&w=majority";

// executing seeding procedure each time we re-start the server
 // seedDB(); // seed the database

// need to tell Express to use body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Telling to app.js to serve "/public" directory.
// "__dirname" referes to the directory where this
// script is running.
app.use(express.static(__dirname + "/public"));
// We have to tell to "methodOverride" what to look for
// therefore we pass "_method"
app.use(methodOverride("_method"));

app.use(flash()); // messages will be displayed in the header file(header.ejs)



// //connecting to local mongoose DB on GoormIDE
// mongoose.connect("mongodb://localhost:27017/yelp_camp_v12_2", { useNewUrlParser: true,
// useUnifiedTopology: true
// }); 

// // connecting to MongoDB
// mongoose.connect("mongodb+srv://mm1544:vQlmeCsumXcN1XVg@cluster0-xn0rp.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true,
// useUnifiedTopology: true
// });


// connecting to the database:
mongoose.connect(url, {
	useNewUrlParser: true,
	//useCreateIndex: true,
	useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB!');
}).catch(err => {
    console.log('Error: ', err.message);
});

// *Now moment is available for use in all of your view files via the variable named moment
app.locals.moment = newMoment;

// PASSPORT CONFIGURATION
var MongoStore = require('connect-mongo')(express_session);
// Setting-up Express session
app.use(express_session({
	secret: "daug pinigu turesiu...",
	store: new MongoStore({
		url: "mongodb+srv://mm1544:vQlmeCsumXcN1XVg@cluster0-xn0rp.mongodb.net/test?retryWrites=true&w=majority",
      	autoRemove: 'native'
      	//autoRemoveInterval: 10 // In minutes. Default
	}),
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// passing method User.authenticate(), which comes with
// "passportLocalMongoose"
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Need to pass info about current user to every 
// single route, and this is the easy way, without 
// manualy adding code to every route
app.use(function(req, res, next){
	// we want to pass req.user to every template
	// whatever we will put in  !!!res.locals!!!, it will be
	// available inside of our !templates!
	res.locals.currentUser = req.user;
// 	If there is anything in the Flash, we will have an access to it in the template under .error 
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
// 	need to move to the nex/folowing code:
	next();
});

// telling to "app" to use those 3 route files that
// we have imported/required
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


if(process.env.LOCAL){
	// for local testing: http://localhost:8080
	app.listen(8080, function(){
		console.log("The YelpCamp Server Has Started");
	});
} else {
	app.listen(process.env.PORT, process.env.IP); 
}

// // for local testing http://localhost:8080
// app.listen(8080, function(){
// 	console.log("The YelpCamp Server Has Started");
// });



// for Heroku
// "process.env.PORT, process.env.IP"  are environment variables
// they refer to the environment where this code is beying runed
// app.listen(process.env.PORT, process.env.IP); 
