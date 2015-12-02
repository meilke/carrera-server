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