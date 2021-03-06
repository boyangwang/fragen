var express = require("express");
var connect = require('connect')
var app = express();
var server = require("http").createServer(app);
var routes = require('./routes');
var db = require('./database.api.js');
var config = require("./config/config.js");
var cookie = require('cookie');
var expressSession = require('express-session');
var store = new expressSession.MemoryStore();
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var magicModuleId = 1; // cs1231
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use("/public", express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(parseCookie = cookieParser(config.SECRET_KEY));
app.use(expressSession({
	secret: config.SECRET_KEY,
	key: config.AUTH_COOKIE_NAME, //session key for user auth cookie
	store: store,
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new GoogleStrategy({
	clientID        : '772185317189-6u8bu11pq5fhtsk0mce64hte3kspr9ah.apps.googleusercontent.com',
	clientSecret    : 'Gz3tJNU88OBKJFaR7ddhh6KZ',
	callbackURL     : config.AUTH_CALLBACK_URL,
}, function(token, refreshToken, profile, done) {
	console.log('in strategy', profile, token);
	process.nextTick(function() {
		var user = { accessToken: token,
			refreshToken: refreshToken,
			id: profile.id, username: profile.displayName, displayName: profile.displayName,
			profilePic: profile.photos && profile.photos[0] && profile.photos[0].value,
			email: profile.emails && profile.emails[0] && profile.emails[0].value
		};
		return done(null, user);
	});
}));

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/");
	}
}

app.get("/", routes.index);
app.get("/terms", function(req, res) {
	res.render('terms')
});
app.get("/about", function(req, res) {
	res.render('about')
});
app.get('/masterArr', function(req, res) {
	res.json(masterArr);
});

app.get('/auth/google',
	passport.authenticate('google', { scope : ['profile', 'email'] }),
	routes.postAuthenticate);
app.get('/auth/google/callback',
	passport.authenticate('google', {failureRedirect: '/loginError'}),
	function(req, res) {
		console.log("Auth success!");
		console.log('req.session.passport', req.session.passport);
		db.updateUserInfo(req.session.passport.user.id, req.session.passport.user.username, req.session.passport.user.profilePic, req.session.passport.user.displayName, function() {
			res.redirect('/dashboard');
		});
	});
app.get('/loginError', routes.loginError);
app.get('/signout', routes.logout);

app.get('/dashboard', ensureAuthenticated,
	function(req, res) {
		console.log('in dashboard, req.user: ', req.user);
		res.render('dashboard', {user: req.user, fbpic: req.user.profilePic, collectionURL: ''});
	}
);

app.get('/question/:questionId', function(req, res) {
	var qn = masterArr.findPost(req.params.questionId);
	if (qn && qn.type == 0) {
		db.getModuleById(qn.module_id, function(result) {
			res.render('post', {content: qn, module: result[0]});
		});
	} else {
		res.redirect('/dashboard');
	}
});

app.get("/question/data/:questionId", function(req, res) {
	var qn = masterArr.findPost(req.params.questionId);
	res.json(qn);
});

// need to pass in :moduleCode as magic
app.get('/modules/:moduleTitle', ensureAuthenticated, function(req, res) {
	db.getUserInfo(req.user.id, function(db_user) {
		console.log("DB_USER: " + db_user[0]);
		db.getModuleByTitle(req.params.moduleTitle,
			function(result) {
				if (result.length && result[0]) {
					res.render('socketBoard', {user: req.user, moduleid: result[0].id, module: result[0], fbpic: db_user[0].fbpic_url});
				} else {
					res.redirect('/dashboard');
				}
			}
		);
	});
});


// app.get('/getModQn/:moduleid') {
// 	// res.json(correctArrToReturn);
// }

// master of the masters, array of arrays.
// Introducing masterArrMod, for the sake of modules

var masterArrMod = [];
db.init(config.db);
console.log('db module init!');

// Introducing master arr, where we store all data
var masterArr = [];
masterArr.findPost = function(id) {
	for (var i = 0; i < masterArr.length; i++) {
		if (masterArr[i].id == id) {
			return masterArr[i];
		}
		for (var j = 0; j < masterArr[i].answers.length; j++) {
			if (masterArr[i].answers[j].id == id) {
				return masterArr[i].answers[j];
			}
		}
	}

}

// Init db
// Retrieve posts from mysql db and push to masterArr

var db_limit = 65535; // How many qns do you want in one page?
var db_offset = 0; // TODO: multipage thingy

db.getAllQuestions(function(results) {
	for (var i = 0; i < results.length; i++) {
		// console.log(results[i]);
		masterArr.push(results[i]);
		masterArr[i].answers = [];
		// A closure just for the callback
		(function(i, cur_result) {
			// load answers of cur qn
			db.getAnswers(cur_result.id, db_limit, db_offset, function(answers) {
				for (var j = 0; j < answers.length; j++) {
					masterArr[i].answers.push(answers[j]);
					// load comments of cur ans
					masterArr[i].answers[j].comments = [];
					(function(i, j, cur_ans) {
						db.getComments(cur_ans.id, db_limit, db_offset, function(comments) {
							for (var k = 0; k < comments.length; k++) {
								masterArr[i].answers[j].comments.push(comments[k]);
							}
						});
					})(i, j, answers[j]);
				}
			});
		})(i, results[i]);
		// load comments of cur qn
		masterArr[i].comments = [];
		(function(i, cur_result) {
			db.getComments(cur_result.id, db_limit, db_offset, function(comments) {
				for (var j = 0; j < comments.length; j++) {
					masterArr[i].comments.push(comments[j]);
				}
			});
		})(i, results[i]);
	}
});



// For server side, emit sender and handler almost always together
// The flow is: 1. Received emit from client 2. Push to masterArr
//				3. Store to db 4. emit a signal to all client
var io = require("socket.io")(server);
io.on("connection", function(socket) { //general handler for all socket connection events
	console.log('socket connected!')
	var cookies = cookie.parse(socket.handshake.headers.cookie);

	//console.log(cookies['express.sid']);
	var session_id = cookieParser.signedCookie(
			cookies[config.AUTH_COOKIE_NAME], config.SECRET_KEY)

	console.log("parsed session_id:" + session_id);

	store.get(session_id, function(err, session) {
		console.log('Retrieving user info from session store using auth cookie');
		//console.log(session);

		if (session) {
			var user_cookie = session.passport.user;
			console.log("USER COOKIE", user_cookie);
			// Example:
			// user_cookie = { id: '100003334235610',
			// 				username: 'yos.riady',
			// 				displayName: 'Yos Riady' }

			// side track a little. Here we retrieve all the votes from this
			// specific user. It needs to be here because we need id
			db.getVotes(user_cookie.id, function(data) {
				socket.emit('userVotes', data);
			});

			socket.user_cookie = user_cookie; //attach cookie to socket object
		}
	});

	socket.on("comment", function(data) {
		db.addComment(socket.user_cookie.id, data.post_id, data.content, data.anon, function(id) {
			db.getComment(id, function(results) {
				if (results[0]) {
					var cur_post = masterArr.findPost(results[0].post_id);
					if (cur_post) {
						if (cur_post.comments) {
							cur_post.comments.push(results[0]);
						}
						else {
							cur_post.comments = [];
							cur_post.comments.push(results[0]);
						}
						io.sockets.emit('comment', results[0]);
					}
				}
			});
		});
	});

	socket.on("ans", function(data) {
		db.addAnswer(socket.user_cookie.id, data.parent_id, data.content, data.anon, function(id) {
			db.getAnswer(id, function(results) {
				if (results[0]) {
					for (var i = 0; i < masterArr.length; i++) {
						// Find the question which this answer belongs to
						if (masterArr[i].id == results[0].parent_id) {
							masterArr[i].answers.push(results[0]);
							masterArr[i].answers[masterArr[i].answers.length - 1].comments = [];
							io.sockets.emit('ans', results[0]);
							break;
						}
					}
				}
			});
		});
	});

	socket.on("post", function(data) {
		db.addQuestion(socket.user_cookie.id, data.title, data.content, data.module_id, data.anon, function(id) {
			// Post OG story from server as the ID is only known at this point, not on the client side.
			db.getQuestion(id, function(results) {
				if (results[0]) {
					masterArr.push(results[0]);
					masterArr[masterArr.length - 1].answers = [];
					masterArr[masterArr.length - 1].comments = [];
					io.sockets.emit('post', results[0]);
				}
			});
		});
	});

	socket.on('vote', function(clientVote) {
		console.log(clientVote);
		if (clientVote.type == 1) {
			db.voteUp(socket.user_cookie.id, clientVote.post_id, function(result) {
				if (result) {
					db.getPost(clientVote.post_id, function(results) {
						if (results[0]) {
							var curPost = masterArr.findPost(results[0].id);
							if (curPost) {
								curPost.votecount = results[0].votecount;
							}
							io.sockets.emit('vote', results[0]);
						}
					});
				}
			});
		}
		else if (clientVote.type == -1) {
			db.voteDown(socket.user_cookie.id, clientVote.post_id, function(result) {
				if (result) {
					db.getPost(clientVote.post_id, function(results) {
						if (results[0]) {
							var curPost = masterArr.findPost(results[0].id);

							if (curPost) {
								console.log('enter votecount update');
								curPost.votecount = results[0].votecount;
							}
							io.sockets.emit('vote', results[0]);
						}
					});
				}
			});
		}
	});

	socket.on('rmVote', function(clientVote) {

		db.voteCancel(socket.user_cookie.id, clientVote.post_id, function(results) {
			console.log("cancel vote");
			db.getPost(clientVote.post_id, function(results) {
				if (results[0]) {
					var curPost = masterArr.findPost(results[0].id);
					if (curPost) {
						curPost.votecount = results[0].votecount;
					}
					io.sockets.emit('vote', results[0]);
				}
			});
		});
	});

	console.log('hand shake done');
});

server.listen(config.port);
console.log("Express is listening on port " + config.port);
