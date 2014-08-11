var SharedNav = function(user) {

   this.initialize = function() {
      this.el = $('<div/>');
   };

   this.render = function(auth) {
      this.el.html(SharedNav.template({auth: auth}));
      return this;
   };

   this.initialize();
}

SharedNav.template = Handlebars.compile($('#nav-tp').html());
