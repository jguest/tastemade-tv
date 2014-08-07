var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app);

// serve static files
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.send('hello world');
});

server.listen(5000, function() {
	console.log('listening on %d', server.address().port);
});