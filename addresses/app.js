var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/addresses');

var app = express();
var server = require('http').Server(app);
server.listen(8081);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

var addresses = [];
var Address = require('./addressesSchema.js');
Address.find({code: 'baseSet'}, function(err, stuff) {
    if (stuff.length == 0) {
        Address.create({
            code: 'baseSet',
            data: []
        }, function(err, stuff) {
            if (err) {
                console.log(err);
            }
        });
    } else {
        addresses = stuff[0].data;
    }
});

app.get('/list', function(req, res) {
    res.json({
        list: addresses
    });
});

app.post('/update', function(req, res) {
    addresses = req.body.list;
    Address.update(
        {code: 'baseSet'},
        {code: 'baseSet', data: addresses},
        function(err) {
            if (err) {
                console.log(err);
            }
        }
    );
    res.sendStatus(200);
});

app.get('/', function(req, res) {
    res.sendFile('index.html');
});


module.exports = app;
