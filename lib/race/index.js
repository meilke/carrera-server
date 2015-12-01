var now = Date.now(),
  players = [],
  config,
  _ = require('lodash');

function getLastLap(p) {
  var player = findPlayerByName(p.name);
  if (player.lapData.length == 0) {
    return {elapsedSec: 0};
  }
  return _.last(player.lapData);
}

function getBestLap(p) {
  var player = findPlayerByName(p.name);
  if (player.lapData.length == 0) {
    return {elapsedSec: 0};
  }
  return _.sortByOrder(player.lapData, ['elapsedSec'], ['asc'])[0];
}

function newPlayer(now, player) {
  return {
           name: player.name,
           laps: 0,
           lapData: [],
           lastTime: now,
           color: player.color
  };
}

function findPlayerByName(playerName) {
  var matchingPlayers = _.filter(players, function (player) { return player.name === playerName; });
  return matchingPlayers[0];
}

function reset() {
  now = Date.now();
  players = _.map(config.players, _.partial(newPlayer, now));
}

function stop() {

}

function addLap(p) {
  var player = findPlayerByName(p.name);
  player.laps++;
  var newTime = Date.now();
  var elapsedMs = newTime - player.lastTime;
  player.lapData.push({elapsedMs: elapsedMs, elapsedSec: elapsedMs/1000});
  player.lastTime = newTime;
}

function initialize(_config_) {
  config = _config_;
  
  return {
    start: reset,
    stop: stop,
    addLap: addLap,
    findPlayerByName: findPlayerByName,
    getBestLap: getBestLap,
    getLastLap: getLastLap,
    getPlayers: function () { return players; }
  };
}

module.exports = initialize;
