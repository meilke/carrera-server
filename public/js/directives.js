angular.module('raceApp').directive('bestLap', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      lap: '=lap',
      name: '=name'
    },
    templateUrl: 'public/template/best-lap.html'
  };
});