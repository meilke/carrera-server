var express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  _ = require('lodash'),
  config = require('config'),
  gpio = require('./lib/gpio' + config.gpio.module)(),
  Race = require('./lib/race/Race'),
  race = new Race(config),
  bodyParser = require('body-parser');

function watch() {
  gpio.watch(config, function (player) {
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
}

app.use('/public', express.static('public'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/players', function(req, res) {
  res.status(200).json(config.players);
});

app.put('/api/players', function(req, res) {
  if (race.running) {
    res.sendStatus(405);
  } else {
    config.players = req.body;
    watch();
    res.sendStatus(204);
  }
});

watch();

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
    race.start(config.players);
  });
  socket.on('reset', function () {
    race.stop();
    io.emit('stopped', race.getPlayers());
    race.start(config.players);
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
