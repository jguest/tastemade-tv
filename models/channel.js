var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var episodeSchema = new Schema({
    name: String,
    loc: { lon: String, lat: String }
});

var channelSchema = new Schema({
    name: String,
    description: String,
    userId: String,
    streaming: { type: Boolean, default: false },
    episodes: [episodeSchema]
});

channelSchema.statics = {

    list: function(criteria, cb) {
        this.find(critera, 'id name', function(err, listeners) {
            return cb(listeners, err);
        });
    }

}

channelSchema.methods = {

    stream: function(episode, cb) {
        this.broadcasts.push(episode);
        this.save(function (err) {
            return cb(err);
        });
    }

}

mongoose.model('Episode', episodeSchema);
mongoose.model('Channel', channelSchema);