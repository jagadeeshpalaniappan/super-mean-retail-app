//NodeJS Libraries

var express = require('express');     //NodeJS 'Web App Framework'
var wagner = require('wagner-core');  //NodeJS 'Dependency Injection'  :helps to separate the Construction and Initialization


//Adding Wagner Dependencies: MongoDB Models
require('./models')(wagner);

//Adding Wagner Dependencies:  Stripe, Fx, Config
require('./dependencies')(wagner);


//Create a Express App
var app = express();


//-----------------Express Configuration-------------------

//Attach : 'Hybrid Mobile App Configuration' with Express App
//This configuration helps to ALLOW -Cross Origin -requests from any origin
app.use(function (req, res, next) {
  res.append('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.append('Access-Control-Allow-Credentials', 'true');
  res.append('Access-Control-Allow-Methods', ['GET', 'OPTIONS', 'PUT', 'POST']);
  res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


//Attach: 'Logger' Module with Express App
app.use(require('morgan')());


//Attach: 'Passport Authentication Configuration' with Express App
//Calling setupAuth function using 'wagner' --so all dependencies will be attached
//Also passing local dependency 'app' -while calling the setupAuth function
wagner.invoke(require('./auth'), {app: app});


//REST -API
//Attach: 'Router' 
app.use('/api/v1', require('./api')(wagner));

// Serve up static HTML pages from the file system.
// For instance, '/6-examples/hello-http.html' in
// the browser will show the '../6-examples/hello-http.html'
// file.
//app.use(express.static('../', {maxAge: 4 * 60 * 60 * 1000 /* 2hrs */}));


//Attach: 'Static File Configuration' with Express App
app.use(express.static('../client', {maxAge: 4 * 60 * 60 * 1000 /* 2hrs */}));


//Application PORT
app.listen(3000);
console.log('Listening on port 3000!');
