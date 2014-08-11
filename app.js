var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	mongoose = require('mongoose'),
	WebSocket = require('ws');
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

var WebSocketServer = WebSocket.Server,
	wss = new WebSocketServer({ port: 9080 });

wss.broadcast = function(message) {
	for (var i in this.clients)
		this.clients[i].send(message);
}

wss.on('connection', function(ws) {
	ws.on('message', function(data) {
		wss.broadcast(data);
	});
	ws.on('error', function(err) {
		console.log(err);
	});
});

// api wrapper
var TastemadeWrapper = require('./lib/tastemade');

// routing logic with dependency injection
var routes = require('./routes')(new TastemadeWrapper, mongoose);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
	
	// load single page application
	app.get('/', function(req, res) {
	    res.sendfile('index.html', { root: __dirname });
	});

	// not found
	app.get('/not-found', function(req, res) {
		res.sendfile('not-found.html', { root: __dirname });
	});

	// api posts
	app.post('/register', routes.register);
	app.post('/login', routes.login);
	app.post('/broadcast', routes.newBroadcast);

	// api puts
	app.put('/:broadcast_id/stream', routes.stream);

	// api gets
	app.get('/broadcast/:id', routes.broadcast);
	app.get('/broadcasts', routes.broadcasts);
	app.get('/places', routes.places);

	server.listen(5000, function() {
		console.log('listening on %d', server.address().port);
	});
});