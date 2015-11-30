var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var config = {
  ledPin: { bcm: 17, wpi: 0 },
  photoPin: { bcm: 4, wpi: 7 },
  players: [ { name: 'first', color: 'red' } ]
};

var gpio = require('./lib/gpio')(config);
var race = require('./lib/race')(config);

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  gpio.watchForSwitch(function() {
    console.log('lap');
    io.emit('lap', 'lap');
  });
});

process.on('SIGINT', function() {
  gpio.deinitialize();
  race.stop();
  process.exit();
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
