var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var broadcastSchema = new Schema({
    episode_name: String,
    user_id: String,
    username: String,
    streaming: { type: Boolean, default: false },
    place: String,
    city: String,
    state: String,
    cameras: Array
}, { collection: 'broadcasts' });

broadcastSchema.virtual('video_slug').set(function() {
    var slugStr = place.replace("&", "and") + " " + city + " " + state;
    return slugStr.replace(/\s+/g, '-').toLowerCase();
});

broadcastSchema.statics = {

    list: function(criteria, cb) {
        this.find(criteria, 'id place episode_name username', function(err, listeners) {
            return cb(err, listeners);
        });
    }

}

broadcastSchema.methods = {

    toggleStream: function(cb) {
        this.streaming = this.streaming ? false : true;
        this.save(function (err) {
            return cb(err);
        });
    }

}

mongoose.model('Broadcast', broadcastSchema);