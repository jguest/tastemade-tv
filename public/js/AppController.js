var AppController = function(action) {
	
	var self = this,
			user_id = localStorage.getItem('user_id'),
			username = localStorage.getItem('username');

	var splitAction = action.split("/"),
			action = template = splitAction[0],
			params = splitAction.slice(1);

	// helper functions

	var redirectTo = function(template, pathParam) {
		$('#ajax-loader').fadeOut();
		if (pathParam) template += "/" + pathParam;
		window.location.hash = template;
	}

	var render = function(template, data, cb) {
		if (!template) template = self.template;
		
		var hbs = Handlebars.compile($("#" + template).html());
		if (data) hbs = hbs(data);

		new ViewHelper().render(hbs, cb);
	}

	var error = function(text) {
		$('#ajax-loader').fadeOut();
		$('#alert-message').html(new AlertMessage(text).render().el);
		$('#alert-message').fadeIn();
	}

	this.exec = function(data) {
		if (data) params.push(data);
		if (this._exec[action]) {
			this._exec[action].apply(this, params);
		} else {
			redirectTo('notFound');
		}
	}

	// controller methods

	this._exec = {

		index: function() {
			$.get('/broadcasts', function(data) {
				render('index', data);
			});
		},

		notFound: function() {
			render('notFound', {}, function() {
				$('#not-found').load('/not-found pre');
			});
		},

		login: function() {
			render('login');
		},

		loginSubmit: function(params) {
      $.post('/login', params, function(data) {
        if (data.statusCode >= 400) {
          error(data.userMessage || data.message);
        } else {
          localStorage.setItem('user_id', data._id);
          localStorage.setItem('username', data.username);
          redirectTo("index");
        }
      });
		},

		logout: function() {
			localStorage.removeItem('user_id');
			localStorage.removeItem('username');
			redirectTo('login');
		},

		signup: function() {
			render('signup');
		},

		signupSubmit: function(params) {
      $.post('/register', params, function(data) {
        if (data.statusCode >= 400) {
          error(data.userMessage || data.message);
        } else {
          redirectTo("login");
        }
      });
		},

		watch: function(broadcast_id) {	
			$.get('/broadcast/' + broadcast_id + "?" + $.param({ user_id: user_id }),
			function(data) {
				render('watch', data.broadcast, function() {
					new SocketHelper(data).init();
				});
			});	
		},

		broadcast: function() {
			navigator.geolocation.getCurrentPosition(function(position) { 
				$.get('/places?' + $.param({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude 
				}), function(data) {
					render('broadcast', { places: data }, function() {
						$('.place').click(function() {
							$('#placeid').val($(this).attr('id'));	
							$('#place').val($(this).text());
						});
					});
				});
			});
		},

		broadcastSubmit: function(params) {
			if (!params.placeid) error("That can't be right.");
			if (!params.camera1) error("You can't stream video without a camera...")

			params.username = username;
			params.user_id = user_id;
			$.post('/broadcast', params, function(data) {
				redirectTo('watch', data._id);
			});
		}

	}
};