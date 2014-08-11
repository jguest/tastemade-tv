var app = {

  initialize: function() {
		this.registerEvents();
		this.route();
  },

  registerEvents: function() {
		$(window).on('hashchange', $.proxy(this.route, this));
  },

  route: function() {
   	var hash = window.location.hash,
        auth = localStorage.getItem('user_id');

    var navigation = new SharedNav().render(auth);
   	$('#nav').html(navigation.el);

    // save memory, video decoder is quite large
    window.instacam = null;    

   	if (!hash) {
      window.location.href += "#index";
   	} else if (auth || /#(signup)$|#(login)$/.test(hash)) {
      this.execute(hash.substring(1, hash.length));
   	} else {
      window.location.hash = "login";
    }
  },

  execute: function(action) {
    new AppController(action).exec();
  }
};

app.initialize();
