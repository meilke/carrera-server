angular.module('raceApp', ['ngRoute']);

angular.module('raceApp').config(function ($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'public/template/race.html',
      controllerAs: 'main',
      controller: 'MainController'
    }).
    when('/setup', {
      templateUrl: 'public/template/setup.html',
      controllerAs: 'setup',
      controller: 'SetupController'
    }).
    otherwise({
      redirectTo: '/'
    });
});