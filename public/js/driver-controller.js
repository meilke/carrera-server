angular.module('raceApp').controller('DriverController', function ($scope, $timeout, RaceService, ControllerHelper) {
  var driver = this;
  reset();

  driver.init = function (name) {
    driver.name = name;
    $scope.$on('lap:' + name, lap);
    $scope.$on('false-start:' + name, falseStart);
    $scope.$on('stopped', function () { $timeout(reset, 1); });
  }

  function lap(event, player) {
    ControllerHelper.within($scope, function () {
      driver.player = player;
      driver.laps = player.lapData.slice(-5).reverse();
      driver.numberOfLaps = player.laps;
    });
  }

  function falseStart(event, player) {
    ControllerHelper.within($scope, function () {
      driver.falseStart = true;
    });
  }

  function reset(event) {
    driver.numberOfLaps = 0;
    driver.falseStart = false;
    driver.laps = [];
    driver.player = {};
  }
});