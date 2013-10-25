var express = require('express')
require('express-namespace')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var api = require('./lib/api.js')
var ClientSocketHandler = require('./lib/ClientSocketHandler.js')

app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.bodyParser());

var port = 3019;
server.listen(port, function() {
  console.log('listening to port '+port);
});

app.namespace('/api', api(app));


io.set('log level', 1);
io.sockets.on('connection', ClientSocketHandler.handleClient);
