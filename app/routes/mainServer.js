var rooms = require('./../models/rooms.js');

module.exports = {
    Start: function(app) {
        app.get('/', function(req, res) {
            res.sendFile('index.html');
        });
        app.get('/rooms/get', function(req, res) {
            var roomCode = req.query.room_code;
        });
        app.post('/rooms/create', function(req, res) {
            var roomCode = req.body.room_code;
            var roomName = req.body.room_name;
        });
        app.post('/users/signin', function(req, res) {
            var fbId = req.query.fb_id;
        });
    }
};