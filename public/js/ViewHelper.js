var ViewHelper = function() {

  this.initialize = function() {
    $("#page").remove();
    this.el = $('<div/>');
  };

  this.render = function(template, cb) {
    this.el.html(template);
    $(this.el).attr('id', 'page');
    $('body').append(this.el);
    this.registerEvents(cb);
  };

  this.registerEvents = function(cb) {

    $('#ajax-loader, #alert-message').hide();

    // form submissions
    $('.submit-form').click(function(){
      var form_div  = $(".form-fields");
      var inputs    = form_div.find('input, textarea');
      var data      = {};

      $(inputs).each(function() {
        if ($(this).val()) {
           data[$(this).prop("name")] = $(this).val();
        }
      });

      $('#ajax-loader').fadeIn();
      new AppController(form_div.attr("name")).exec(data);
    });

    if (cb) { cb(); }
  };

  this.initialize();
}
