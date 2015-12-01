var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');

var config = {
  players: [
    { name: 'first', color: 'red', photoPin: { bcm: 4, wpi: 7 }, ledPin: { bcm: 17, wpi: 0 } },
    { name: 'second', color: 'blue', photoPin: { bcm: 25, wpi: 6 }, ledPin: { bcm: 17, wpi: 0 } }
  ]
};

var gpio = require('./lib/gpio')(config);
var race = require('./lib/race')(config);
race.start();

app.use('/public', express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/players', function(req, res) {
  res.json(config.players);
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
    io.emit('lap', race.getPlayers());
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
