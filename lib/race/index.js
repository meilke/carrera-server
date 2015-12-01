var now = Date.now(),
  players = [],
  config,
  _ = require('lodash'),
  uuid = require('node-uuid'),
  leader;

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

function createLap(player, time) {
  var elapsedMs = time - player.lastTime;
  return {
    elapsedMs: elapsedMs,
    elapsedSec: elapsedMs/1000,
    id: uuid.v4(),
    lap: player.laps
  };
}

function updatePlayer(player) {
  var newTime = Date.now();
  player.lapData.push(createLap(player, newTime));
  player.laps++;
  player.lastTime = newTime;
}

function setLeader(player) {
  leader = { laps: player.laps, player: player };
}

function updateLeaderIfNecessary(player) {
  if (player.laps > leader.laps) {
    setLeader(player);
  };
}

function reset() {
  now = Date.now();
  players = _.map(config.players, _.partial(newPlayer, now));
  setLeader(players[0]);
}

function stop() {

}

function addLap(p) {
  var player = findPlayerByName(p.name);
  updatePlayer(player);
  updateLeaderIfNecessary(player);
}

function getPlayers() {
  return _.map(players, function (player) {
    return _.extend({ leader: player.name === leader.player.name }, player);
  });
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
    getPlayers: getPlayers
  };
}

module.exports = initialize;
