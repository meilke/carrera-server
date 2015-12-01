var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');

var config = {
  players: [ { name: 'first', color: 'red', photoPin: { bcm: 4, wpi: 7 }, ledPin: { bcm: 17, wpi: 0 } } ]
};

var gpio = require('./lib/gpio')(config);
var race = require('./lib/race')(config);
race.start();

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

gpio.watch(function(player) {
  var racePlayer = race.findPlayerByName(player.name);
  race.addLap(racePlayer);
  io.emit('lap', race.getPlayers());
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('reset', function() {
    race.stop();
    race.start();
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
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
