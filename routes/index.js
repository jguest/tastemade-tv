module.exports = function(tastemade, mongoose) {
	
	var Channel = mongoose.model('Channel'),
		Broadcast = mongoose.model('Episode');

	return {

		// @required name, username, password
		register: function(req, res) {
			tastemade.signup(req.query.name, req.query.username, req.query.password,
				function(json) {
					res.json(json);
			 	}
			);
		},

		// @required username, password
		login: function(req, res) {
			tastemade.login(req.body.username, req.body.password,
				function(json){
					res.json(json);
				}
			);
		},

		// @required name, lon, lat
		broadcast: function(req, res) {
			Channel.findById(req.query.id, function(err, channel) {
				if (err) req.json({error: error})
				else {
					channel.stream(new Episode({
						name: req.query.name,
						location: [req.query.lat, req.query.lon]
					}), function(err) {
						if (err) res.json({error: error});
						else res.json(channel);
					})
				}
			});
		},

		// @required user_id, name, description 
		new_channel: function(req, res) {

			var channel = new Channel({
				name: req.query.name,
				user_id: req.query.user_id,
				description: req.query.description,
			});

			channel.save(function(err) {
				if (err) res.json({error: err});
				else res.json(channel);
			});
		},

		// @required id
		channel: function(req, res) {
			Channel.findById(req.query.id, function(err, channel) {
				if (err) res.json({error: err})
				else res.json(channel);
			});
		},

		channels: function(req, res) {
			Channel.list({}, function(channels) {
				if (err) res.json({error: err})
				else res.json(channels);
			});
		},

		// @optional starting_with
		cities: function (req, res) {
			tastemade.locations(req.query.starting_with, function(json) {
				res.json(json);
			});
		}
	}
}