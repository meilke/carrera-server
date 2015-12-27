angular.module('raceApp').controller('MainController', function ($scope, $timeout, RaceService, ControllerHelper) {
  var main = this;
  main.isCountingDown = false;
  main.countdownText = 'Countdown';

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
    ControllerHelper.within($scope, function () {
      main.secondsToGo = 0;
      main.countdownText = 'Go!'
      $timeout(function () {
        main.isCountingDown = false;
        main.countdownText = 'Countdown';
      }, 1000);
    });
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