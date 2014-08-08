module.exports = function() {
   
    var request = require('request');
    var querystring = require('querystring');

    var API_KEY = "webdevtest",
        BASE_URL = "https://api.tmade.co/v1";
   
    return {
        
        signup: function(name, username, password, cb) {
            return this._request('/auth/register', {
                "name" : name,
                "username": username,
                "password": password,
            }, 'POST', cb);
        },

        login: function(username, password, cb) {
           return this._request('/auth/login', {
               "username": username, 
               "password": password
            }, 'POST', cb);
        },

        locations: function(starting_with, cb) {
            this._request('/locations', { "q": starting_with || "" }, 'GET', cb);
        },

        _request: function(path, data, method, cb) {
            data["api_key"] = API_KEY;
            if (method == 'GET') path += "?" + querystring.stringify(data);

            var options = {
                url: BASE_URL + path, 
                method: method,
                strictSSL: false,
                headers: { "X-Api-Key": API_KEY }
            }

            if (method == 'POST') {
                options.json = data;
            }

            console.log(options);

            request(options, function(error, response, body) {
                if (error) console.log(error);
                console.log(body);
                cb(body);
            });
        }
    }
}
