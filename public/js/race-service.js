angular.module('raceApp').factory('RaceService', function ($rootScope) {
  var socket = io();

  socket.on('lap', function (players) {
    _.each(players, function (player) {
      $rootScope.$broadcast('lap:' + player.name, player);
    });
    $rootScope.$broadcast('best:lap', bestLap(players));
    $rootScope.$broadcast('best:player', _.find(players, function (p) { return p.leader; }));
  });

  socket.on('countdown', function (countdown) {
    $rootScope.$broadcast('countdown', countdown);
  });

  socket.on('started', function () {
    $rootScope.$broadcast('started');
  });

  socket.on('stopped', function () {
    $rootScope.$broadcast('stopped');
  });

  socket.on('false-start', function (player) {
    $rootScope.$broadcast('false-start', player);
  });

  function bestLap(players) {
    var player = _.min(players, function (p) {
      return p.bestLap ? p.bestLap.elapsedSec : Number.MAX_VALUE;
    });

    return {
      player: player,
      lap: player.bestLap
    };
  }

  function reset() {
    socket.emit('reset', '');
  }

  function stop() {
    socket.emit('stop', '');
  }

  function playerByName(players, name) {
    return _.filter(players, function (player) { return player.name === name })[0];
  }

  return {
    reset: reset,
    stop: stop
  };
});