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

angular.module('raceApp').directive('lapTimes', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      driver: '=driver'
    },
    templateUrl: 'public/template/laps.html'
  };
});

angular.module('raceApp').directive('lapChart', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      driver: '=driver',
      numberOfLapsShown: '=numberOfLapsShown'
    },
    template: '<canvas height="300" width="200"></canvas>',
    link: function (scope, element, attr) {
      var numberOfLapsShown = scope.numberOfLapsShown || 10;
      var parentElement = element.parent()[0];
      element[0].width = 0.9 * parentElement.offsetWidth;
      var ctx = element[0].getContext('2d');
      var data = {
          labels: _.map(_.range(0, numberOfLapsShown, 0), function () { return ''; }),
          datasets: [
              {
                  label: 'My First dataset',
                  fillColor: 'rgba(220,220,220,0.2)',
                  strokeColor: 'rgba(220,220,220,1)',
                  pointColor: 'rgba(220,220,220,1)',
                  pointStrokeColor: '#fff',
                  pointHighlightFill: '#fff',
                  pointHighlightStroke: 'rgba(220,220,220,1)',
                  data: _.range(0, numberOfLapsShown, 0)
              }
          ]
      };

      var myLineChart = new Chart(ctx).Line(data, {
        scaleOverride: true,
        scaleStepWidth: 1,
        scaleSteps: 10,
        scaleStartValue: 0
      });

      function lap(event, player) {
        var numberOfLaps = scope.driver.allLaps.length;
        var drawnLaps = scope.driver.allLaps.slice(-numberOfLapsShown);
        _.forEach(drawnLaps, function (lap, index) {
          myLineChart.scale.xLabels = _.range(numberOfLaps - drawnLaps.length + 1, numberOfLaps + 1, 1);
          myLineChart.datasets[0].points[index].value = lap.elapsedSec;
        });
        myLineChart.update();
      }

      scope.$on('lap:' + scope.driver.name, lap);
      scope.$on('stopped', function () {
        _.forEach(_.range(0, numberOfLapsShown, 0), function (zero, index) {
          myLineChart.scale.xLabels = _.map(_.range(0, numberOfLapsShown, 0), function () { return ''; });
          myLineChart.datasets[0].points[index].value = zero;
        });
        myLineChart.update();
      });
    }
  };
});