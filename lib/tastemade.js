module.exports = function() {
   
    var self = this,
        request = require('request'),
        querystring = require('querystring');

    var API_KEY = "webdevtest",
        BASE_URL = "https://api.tmade.co/v1";
    
    var _request = function(path, data, method, cb) {
        
        if (method == 'GET') {
            data["api_key"] = API_KEY;
            path += "?" + querystring.stringify(data);
        }

        var options = {
            url: BASE_URL + path, 
            method: method,
            strictSSL: false,
            headers: { "X-Api-Key": API_KEY }
        }

        if (method == 'POST') {
            options.json = data;
        }

        request(options, function(error, response, body) {
            if (error) console.log(error);
            cb(body);
        });
    };       
   
    return {
        
        signup: function(params, cb) {
            return _request('/auth/register', {
                "name" : params.name,
                "email": params.email,
                "username": params.username,
                "password": params.password,
            }, 'POST', cb);
        },

        login: function(params, cb) {
           return _request('/auth/login', {
               "username": params.username, 
               "password": params.password
            }, 'POST', cb);
        },

        venueVideos: function(slug, cb) {
            return _request('/venues/' + slug, {}, 'GET', function(data) {
                _request(data._videosUrl, {}, 'GET', function(videos) {
                    cb(videos);
                });
            });
        },
    }
}
