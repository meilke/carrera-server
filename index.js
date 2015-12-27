var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  _ = require('lodash'),
  config = require('config'),
  gpio = require('./lib/gpio' + config.gpio.module)(config),
  Race = require('./lib/race/Race'),
  race = new Race(config);

app.use('/public', express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/players', function(req, res) {
  res.json(config.players);
});

gpio.watch(function (player) {
  if (!race.running) {
    console.log('Signal but race is not started yet:' + player.name);

    if (race.isCountingDown()) {
      io.emit('false-start', player);
    }

    return;
  }

  var racePlayer = race.findPlayerByName(player.name);
  race.signal(racePlayer);
  io.emit('lap', race.getPlayers());
});

race.on('countdown', function (countdown) {
  console.log('countdown', countdown.count);
  io.emit('countdown', countdown);
});

race.on('started', function (players) {
  console.log('race started!');
  io.emit('started', players);
});

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('stop', function() {
    race.stop();
    io.emit('stopped', race.getPlayers());
  });
  socket.on('start', function () {
    race.start();
  });
  socket.on('reset', function () {
    race.stop();
    io.emit('stopped', race.getPlayers());
    race.start();
  });
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

process.on('SIGINT', function () {
  gpio.deinitialize();
  race.stop();
  process.exit();
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
