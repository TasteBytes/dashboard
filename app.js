var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var subdomain = require('express-subdomain')

var userService = require('./user_service');

var index = require('./routes/index');
var login = require('./routes/login');
var register = require('./routes/register');
var features = require('./routes/features');
var downloads = require('./routes/downloads');
var dashboard = require('./routes/dashboard');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/downloads', downloads);
app.use('/features', features);
app.use('/login', login);
app.use('/register', register);
app.use('/dashboard', dashboard);

//Create a new user
app.post('/createuser', function(req, res) {
  var UserName = req.body['name']
  var UserEmail = req.body['email'];
	var UserPass = req.body['password'];
	userService.addUser(UserName, UserEmail, UserPass,
		function(error, uid) {
			if (error) {
				return res.status(500).send(error);
			} else {
				// return res.status(201).send({uid : uid});
        return res.redirect('/');
		}
	});
});

//Login the user
app.post('/userlogin', function(req, res) {
  var UserEmail = req.body['email'];
	var UserPass = req.body['password'];
	userService.authenticate(UserEmail, UserPass,
		function(error, uid) {
			if (error) {
				return res.status(500).send(error);
			} else {
        return res.redirect('/dashboard');
		}
	});
});

//Login the user
app.post('/userlogout', function(req, res) {
	userService.signOut(
		function(error, uid) {
			if (error) {
				return res.status(500).send(error);
			} else {
				// return res.status(201).send({uid : uid});
        return res.redirect('/');
		}
	});
});

//add a new menu item
app.post('/dashboard/addmenu', function(req, res) {
  var menuName = req.body['MenuName'];
  userService.firebase.database().ref(`/users/${userService.firebase.auth().currentUser.uid}/menus/${menuName}`).set({
          "Appetizers": [{
              "Name": "AppetizerName",
              "Description": "Description",
              "Price": 1.50
          }, {
              "Name": "Appetizer2Name",
              "Description": "Description2",
              "Price": 1.50
          }],
  })
  return res.redirect('/dashboard/menus')
});

//add a new category
app.post('/dashboard/addcategory', function(req, res) {
  var menuName = req.body['MenuName'];
  var categoryName=req.body['CategoryName']
  userService.firebase.database().ref(`/users/${userService.firebase.auth().currentUser.uid}/menus/${menuName}/${categoryName}`).set(
          [{
              "Name": "AppetizerName",
              "Description": "Description",
              "Price": 1.50
          }, {
              "Name": "Appetizer2Name",
              "Description": "Description2",
              "Price": 1.50
          }]
  )
  return res.redirect('/dashboard/menus')
});

//add a new entree
app.post('/dashboard/addentree', function(req, res) {
  var path = req.body['Path'];
  var name = req.body['EntreeName'];
  var price = req.body['EntreePrice'];
  var description = req.body['EntreeDescription'];
  //var key=userService.firebase.database().ref(`/users/${userService.firebase.auth().currentUser.uid}/menus/${path}`).
  userService.firebase.database().ref(`/users/${userService.firebase.auth().currentUser.uid}/menus/${path}`).push(
          {
              "Name": name,
              "Description": description,
              "Price": price
          }
  )
  return res.redirect('/dashboard/menus')
});

app.post('/dashboard/deleteItem', function(req, res) {
  var path = req.body['item'];
  console.log(`The path is ${path}`)
  userService.firebase.database().ref(`users/${userService.firebase.auth().currentUser.uid}/menus/${path}`)
  .remove()
  .then(function(){
    console.log("successfully removed")
  }).catch(function(err){
    console.log(err)
  });
  return res.redirect('/dashboard/menus')

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
