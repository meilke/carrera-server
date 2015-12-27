angular.module('raceApp').factory('ConfigService', function ($http) {
  
  function getPlayers() {
    return $http.get('/api/players').then(function (response) { return response.data; });
  }

  return {
    getPlayers: getPlayers
  };
});