module.exports = function(tastemade, mongoose) {
	
	var Broadcast = mongoose.model('Broadcast')
		request = require('request'),
		querystring = require('querystring');

	var _place = function(placeid, cb) {
		request.get("https://maps.googleapis.com/maps/api/place/details/json?" + querystring.stringify({
			placeid: placeid,
			key: "AIzaSyBwc6G3GypzfH3Ds2yIjli1XkKoLvMQT6Q"
		}), function(error, response, body) {
			if (error) cb({});
			else cb(JSON.parse(body).result);
		});
	};

	return {

		// @required name, email, username, password
		register: function(req, res) {
			tastemade.signup(req.body, function(data) {
				res.json(data);
			});
		},

		// @required username, password
		login: function(req, res) {
			tastemade.login(req.body, function(json){
				res.json(json);
			});
		},


		// @required longitude, latitude
		places: function(req, res) {
			request.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json?" + querystring.stringify({
				location: req.query.latitude + "," + req.query.longitude,
				radius: 600,
				types: ["restaurant", "cafe"],
				key: "AIzaSyBwc6G3GypzfH3Ds2yIjli1XkKoLvMQT6Q"
			}), function(error, response, body) {
				if (error) res.json({ error: error });
				else res.json(JSON.parse(body).results);
			});
		},		

		// @required episode_name, user_id, username, venue, placeid, place
		newBroadcast: function(req, res) {
			_place(req.body.placeid, function(place) {

				var placeParams = {},
					cityKey = "locality",
					stateKey = "administrative_area_level_1";

				place.address_components.forEach(function(item) {
					if (item.types) {
						if (item.types.indexOf(cityKey) > -1) {
							placeParams.city = item.long_name;
						} else if (item.types.indexOf(stateKey) > -1) {
							placeParams.state = item.long_name;
						}
					}
				});

				new Broadcast({
					episode_name: req.body.episode_name,
					user_id: req.body.user_id,
					username: req.body.username,
					place: req.body.place,
					city: placeParams.city,
					state: placeParams.state,
					cameras: [req.body.camera1, req.body.camera2, req.body.camera3]
				}).save(function(err, broadcast) {
					if (err) res.json({ error: err });
					else res.json(broadcast);
				});
			});
		},

		// @required :id, user_id
		broadcast: function(req, res) {
			Broadcast.findById(req.params.id, function(err, broadcast) {
				if (err) res.json({error: err})
				else {
					tastemade.venueVideos(broadcast.video_slug, function(data) {
						console.log(broadcast);
						console.log(req.query.user_id);
						res.json({ 
							broadcast: broadcast, 
							videos: data, 
							isBroadcaster: req.query.user_id === broadcast.user_id
						});
					});
				}
			});
		},

		// @return { live: [broadcast], other: [broadcast] }
		broadcasts: function(req, res) {
			json = {};
			Broadcast.list({ streaming: true }, function(err, broadcasts) {
				if (err) res.json({error: err})
				json.live = broadcasts;
			});
			Broadcast.list({ streaming: false }, function(err, broadcasts) {
				if (err) res.json({error: err})
				json.other = broadcasts;
				res.json(json);
			});
		},		

		// @required :broadcast_id
		stream: function(req, res) {
			Broadcast.findById(req.params.broadcast_id, function(err, broadcast) {
				if (err) res.json({error: err})
				else {
					broadcast.toggleStream(function() {
						io.of(broadcast._id).on('connection', function(socket) {
							console.log('broadcast: ' + broadcast._id + " now available.")
						});

						res.json({ status: "OK" });
					});
				}
			});
		}
	}
}