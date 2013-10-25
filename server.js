var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);


app.use(express.static(__dirname + '/public'));

var port = 3000;
server.listen(port, function() {
  console.log('listening to port '+port)
});

app.get('/api', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});