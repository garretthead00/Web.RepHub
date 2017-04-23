
// Packages
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var morgan = require('morgan');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;﻿
var bodyParser = require('body-parser');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
var path = require('path');

// Set port
app.set('port', port);
app.use(express.static(__dirname + "/public")); //Serve static content for the app from the “public” directory in the application directory:

// Middleware
app.use(morgan('dev')); // use morgan to log all url requests
app.use(bodyParser.urlencoded({extended: true})); // parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // parsing application/json
app.use('/api', appRoutes);


// connect to the mongo database and test for connection
mongoose.connect('mongodb://localhost:27017/rephub', function(err){
	if(err){
		console.log("ERROR! not connected to db " + err);
	} else{
		console.log("Successfully connected to rephub database!");
	}

});

app.get('*', function(req,res){
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});


// IMPORTANT to place the 404 and 500 errors after all of the gets b/c
// express acts similar to a pipeline which is some cases will read & fire the error messages before finding the
// needed gets.
app.use(function(req,res){
	res.type('text/html');
	res.status(404);
	res.render('404');
});
app.use(function(req,res){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

// Listen to port
app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost: ' + app.get('port') + ' press Ctrl-C to terminate.');
});;