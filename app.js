//FILE WILL BE REFACTORED LATER TO BRAKE IT INTO SMALLER PEACES

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
	Comment = require("./models/comment"),
	Campground = require("./models/campground"),
	User = require("./models/user"),
	seedDB = require("./seeds");

var commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes			= require("./routes/index");


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



//connecting to local mongoose DB

// mongoose.connect("mongodb://localhost:27017/yelp_camp_v12_2", { useNewUrlParser: true,
// useUnifiedTopology: true
// }); 


// mongoose.connect("mongodb+srv://mm1544:vQlmeCsumXcN1XVg@cluster0-xn0rp.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true,
// useUnifiedTopology: true
// });


// coonecting to the database:
mongoose.connect('mongodb+srv://mm1544:vQlmeCsumXcN1XVg@cluster0-xn0rp.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to MongoDB!');
}).catch(err => {
    console.log('Error: ', err.message);
});



// // Example code
// const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);
	
// app.use(session({
// 		secret: 'foo',
// 		store: new MongoStore(options)
// 	}));


// PASSPORT CONFIGURATION
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
// Setting-up Express session
app.use(session({
	secret: "daug pinigu turesiu...",
	store: new MongoStore({
		url: "mongodb+srv://mm1544:vQlmeCsumXcN1XVg@cluster0-xn0rp.mongodb.net/test?retryWrites=true&w=majority",
      	autoRemove: 'native',
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



// // for local testing
// app.listen(8080, function(){
// 	console.log("The YelpCamp Server Has Started");
// });


// // for Heroku
app.listen(process.env.PORT, process.env.IP);