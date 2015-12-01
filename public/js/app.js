angular.module('raceApp', []);

angular.module('raceApp').factory('RaceService', function ($http) {
  var socket = io();
  var callbacks = {};

  socket.on('lap', function (players) {
    _.each(_.keys(callbacks), function (name) {
      callbacks[name](playerByName(players, name));
    });
  });

  function reset() {
    socket.emit('reset', '');
  }

  function registerForPlayer(callback, name) {
    callbacks[name] = callback;
  }

  function getPlayers() {
    return $http.get('/api/players').then(function (response) { return response.data; });
  }

  function playerByName(players, name) {
    return _.filter(players, function (player) { return player.name === name })[0];
  }

  return {
    reset: reset,
    registerForPlayer: registerForPlayer,
    getPlayers: getPlayers
  };
});

angular.module('raceApp').controller('MainController', function (RaceService) {
  var main = this;

  RaceService
    .getPlayers()
    .then(function (players) {
      main.players = players;
    });
  
  main.reset = function () {
    RaceService.reset();
  };
});

angular.module('raceApp').controller('DriverController', function ($scope, RaceService) {
  var driver = this;
  driver.numberOfLaps = 0;
  driver.laps = [];

  driver.init = function (name) {
    driver.name = name;
    RaceService.registerForPlayer(onLap, name);
  }

  function onLap(player) {
    $scope.$apply(function () {
      driver.player = player;
      driver.laps = player.lapData.slice(-5).reverse();
      driver.numberOfLaps = player.laps;
    });
  }
});