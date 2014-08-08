var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	mongoose = require('mongoose'),
	io = require('socket.io')(server),
	fs = require('fs');

// serve static files
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

// db connection
mongoose.connect('mongodb://localhost/tastemade-tv');

// require all mongoose schemas
var models_dir = './models';
fs.readdirSync(models_dir).forEach(function(file) {
  require(models_dir + '/' + file);
});

// data sources
var TastemadeWrapper = require('./lib/tastemade'),
	Channel = mongoose.model('Channel');

// routing logic with dependency injection
var routes = require('./routes')(new TastemadeWrapper, mongoose);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
	
	// load single page application
	app.get('/', function(req, res) {
	    res.sendfile('index.html', {root: __dirname });
	});

	// api posts
	app.post('/register', routes.register);
	app.post('/login', routes.login);
	app.post('/broadcast', routes.broadcast);
	app.post('channel', routes.new_channel);

	// api gets
	app.get('/channel/:id', routes.channel);
	app.get('/:city/channels', routes.channels);
	app.get('/cities', routes.cities);

	// broadcast controls socket
	io.on('connection', function(socket) {
		socket.emit('foo', 'bar');
	});

	server.listen(5000, function() {
		console.log('listening on %d', server.address().port);
	});
});