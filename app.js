var express = require('express');
var app = express();
var morgan = require('morgan');
var swig = require('swig');
var wikiRouter = require('./routes/wiki');
var usersRouter = require('./routes/users');
var fs = require('fs');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var path = require('path');
var pg = require('pg');
var models = require('./models');
var conString = 'postgres://postgres:password@localhost:5432/wikistack';
var client = new pg.Client(conString);

// templating boilerplate setup
app.set('views', path.join(__dirname, '/views')); // where to find the views
app.set('view engine', 'html'); // what file extension do our templates have
app.engine('html', swig.renderFile); // how to render html templates
swig.setDefaults({ cache: false });

// logging middleware
app.use(morgan('dev'));

// body parsing middleware
app.use(bodyParser.urlencoded({ extended: true })); // for HTML form submits
app.use(bodyParser.json()); // would be for AJAX requests

// start the server
var server = app.listen(1337, function(){
  console.log('listening on port 1337');
});
var io = socketio.listen(server);


// connect to postgres
client.connect();


// the typical way to use express static middleware.
app.use(express.static(path.join(__dirname, '/public')));


// include force: true on lines 48 and 50
// to wipe the database clean on every reboot
// models.User.sync({ force: true })

models.User.sync()
.then(function () {
    return models.Page.sync()
})
.then(function () {
    server.listen(1337, function () {
        console.log('Server is listening on port 1337!');
    });
})
.catch(console.error);

app.get('/', function(req, res, next) {
	res.redirect('/wiki/');
});

app.use('/wiki', wikiRouter);

app.use('/users', usersRouter);

app.get('/search', function(req, res, next) {
  res.render('search');
})
