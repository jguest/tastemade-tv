var AlertMessage = function(text) {
   
   this.initialize = function() {
      this.el = $('<div/>');
   };

   this.render = function() {
      this.el.html(AlertMessage.template(text));
      return this;
   };

   this.initialize();
}

AlertMessage.template = Handlebars.compile($("#alert").html());