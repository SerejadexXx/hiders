var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();
var server = require('http').Server(app);
server.listen(8080);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

var maxPermittedAmount = 30;
var addresses = [{
        host: 'localhost',
        port: 8126,
        val: 'ws://localhost:8126',
        amount: 0
    }
];
/*
    [{
        host: '37.139.26.152',
        port: 8126,
        val: 'ws://37.139.26.152:8126',
        amount: 0
    }
];*/

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

app.get('/rooms/free', function(req, res) {
    var rez = null;
    addresses.forEach(function(address) {
        if (rez) {
            return;
        }
        if (address.amount != 0 && address.amount < maxPermittedAmount / 2) {
            rez = address;
        }
    });
    addresses.forEach(function(address) {
        if (rez) {
            return;
        }
        if (address.amount != 0 && address.amount < maxPermittedAmount) {
            rez = address;
        }
    });
    addresses.forEach(function(address) {
        if (rez) {
            return;
        }
        if (address.amount == 0) {
            rez = address;
        }
    });

    if (!rez) {
        res.sendStatus(503);
    } else {
        res.json({
            address: rez.val
        });
        rez.amount++;
    }
});

//require('./routes/roomServer.js').Start(server, app);

var createRequest = require('./createRequest.js');
setInterval(function() {
    addresses.forEach(function(address) {
        var options = {
            host: address.host,
            port: address.port,
            path: '/room/info',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        createRequest.process(options, function(statusCode, result) {
            if (result && result.amount) {
                address.amount = result.amount;
            }
        });
    });
}, 1000);

module.exports = app;
