angular.module('raceApp').factory('RaceService', function ($http, $rootScope) {
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
    $rootScope.$broadcast('reset');
  }

  function getPlayers() {
    return $http.get('/api/players').then(function (response) { return response.data; });
  }

  function playerByName(players, name) {
    return _.filter(players, function (player) { return player.name === name })[0];
  }

  return {
    reset: reset,
    getPlayers: getPlayers
  };
});