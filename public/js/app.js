angular.module('raceApp', []);

angular.module('raceApp').factory('ControllerHelper', function () {
  function within(scope, action) {
    scope.$apply(function () {
      action();
    });
  }

  return {
    within: within
  };
});

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

angular.module('raceApp').controller('MainController', function ($scope, $timeout, RaceService, ControllerHelper) {
  var main = this;
  main.isCountingDown = false;

  RaceService
    .getPlayers()
    .then(function (players) {
      main.players = players;
    });

  $scope.$on('countdown', countdown);
  $scope.$on('started', started);
  $scope.$on('best:lap', bestLap);
  $scope.$on('best:player', bestPlayer);

  function countdown(event, countdownData) {
    ControllerHelper.within($scope, function () {
      main.isCountingDown = true;
      main.secondsToGo = countdownData.count;
    });
  }

  function started(event) {
    $timeout(function () {
      ControllerHelper.within($scope, function () {
        main.isCountingDown = false;
      });
    }, 1000);
  }

  function bestLap(event, bestLap) {
    ControllerHelper.within($scope, function () {
      main.bestLap = {
        time: bestLap.lap.elapsedSec,
        name: bestLap.player.name
      };
    });
  }

  function bestPlayer(event, player) {
    ControllerHelper.within($scope, function () {
      main.leader = player;
    });
  }
  
  main.reset = function () {
    RaceService.reset();
  };
});

angular.module('raceApp').controller('DriverController', function ($scope, RaceService, ControllerHelper) {
  var driver = this;
  reset();

  driver.init = function (name) {
    driver.name = name;
    $scope.$on('lap:' + name, lap);
    $scope.$on('reset', reset);
  }

  function lap(event, player) {
    ControllerHelper.within($scope, function () {
      driver.player = player;
      driver.laps = player.lapData.slice(-5).reverse();
      driver.numberOfLaps = player.laps;
    });
  }

  function reset(event) {
    driver.numberOfLaps = 0;
    driver.laps = [];
  }
});