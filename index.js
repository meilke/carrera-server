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

function findPlayerByName(playerName) {
  var matchingPlayers = _.filter(race.getPlayers(), function (player) { return player.name === playerName; });
  return matchingPlayers[0];
}

gpio.watch(function(player) {
  var racePlayer = findPlayerByName(player.name);
  race.addLap(racePlayer);
  io.emit('lap', race.getPlayers());
});

io.on('connection', function(socket) {
  console.log('a user connected');
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
