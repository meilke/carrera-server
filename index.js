var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  _ = require('lodash'),
  config = require('config'),
  gpio = require('./lib/gpio' + config.gpio.module)(config),
  race = require('./lib/race')(config);

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
