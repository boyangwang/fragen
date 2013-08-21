var express = require("express");
var app = express();
app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.session({ secret: 'fragen' }));

var FACEBOOK_APP_ID = "492242497533605";
var FACEBOOK_APP_SECRET = "c7fdfdb90ef722119f78eb0476e64de2";
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://dev.fragen.cmq.me:4321/auth/facebook/callback"
  },

  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
    	// console.log(profile);
    	var user = {id:profile.id, username:profile.username, displayName:profile.displayName}
    	// console.log(user);
    	return done(null, user);
    });
  }
));

var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var routes = require('./routes');
var config = require("./config/config.js");

// Routes, refactored to routes/index.js
app.get("/", routes.main);
app.get('/masterArr', function(req, res) {
    res.json(masterArr);
});
// app.get('/classes/:moduleCode', routes.modulePage);
// app.get('/dashboard', routes.dashBoard);


// Auth routes
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("Auth success!");
    res.redirect('/');
  });
app.get('/login', routes.login);
app.get('/logout', routes.logout);
// End of auth routes

// Introducing master arr, where we store all data
var masterArr = [];

// Init db
// Retrieve posts from mysql db and push to masterArr
var db = require('./database.api.js');
db.init(config.db);
console.log('db module init!');

var db_limit = 10; // How many qns do you want in one page?
var db_offset = 0; // TODO: multipage thingy
db.getQuestions(10, 0, function(results) {
	for (var i = 0; i < results.length; i++) {
		masterArr.push(results[i]);
		masterArr[i].answers = [];
		// A closure just for the callback
		(function(i, cur_result) {
			db.getAnswers(cur_result.id, db_limit, db_offset, function(answers) {
				for (var j = 0; j < answers.length; j++) {
					masterArr[i].answers.push(answers[j]);
				}
			});
		})(i, results[i]);
		masterArr[masterArr.length - 1].comments = [];
	}
});

// For server side, emit sender and handler almost always together
// The flow is: 1. Received emit from client 2. Push to masterArr
//				3. Store to db 4. emit a signal to all client

io.sockets.on("connection", function(socket) { //general handler for all socket connection events
	socket.on("comment", function(data) {

	});
	socket.on("ans", function(data) {
		db.addAnswer(data.owner_id, data.parent_id, data.content, function(id) {
			db.getAnswer(id, function(results) {
				if (results[0]) {
					for (var i = 0; i < masterArr.length; i++) {
						// Find the question which this answer belongs to
						if (masterArr[i].id == results[0].parent_id) {
							masterArr[i].answers.push(results[0]);
							io.sockets.emit('ans', results[0]);
							break;
						}
					}
				}
			});
		});
	});
	socket.on("post", function(data) {
		db.addQuestion(data.owner_id, data.title, data.content, function(id) {
			db.getQuestion(id, function(results) {
				if (results[0]) {
					masterArr.push(results[0]);
					masterArr[masterArr.length-1].answers = [];
					io.sockets.emit('post', results[0]);
				}
			});
		});
	});
	socket.on('vote', function(clientVote) {
		console.log("server received vote");
		console.log(clientVote);
		// Because voting db queries not there yet
//		var len = messages.length;
//		var msgToVote;
//		for (var i = 0; i < len; i++) {
//
//			if (parseInt(messages[i].ID) === parseInt(clientVote.ID)) {
//				console.log("found msgToVote");
//				msgToVote = messages[i];
//				break;
//			}
//		}
//
//		if (msgToVote) {
//			if (msgToVote.vote) {
//				msgToVote.vote += clientVote.value;
//			}
//			//---- If vote is not set, set it now -----
//			else {
//				msgToVote.vote = clientVote.value;
//			}
//			io.sockets.emit('vote', {ID: clientVote.ID, value: msgToVote.vote});
//		}
	});
});

server.listen(config.port);
console.log("Express is listening on port " + config.port);
