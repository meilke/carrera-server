angular.module('raceApp').controller('SetupController', function (ConfigService) {

  var setup = this;
  setup.players = [];

  ConfigService
    .getPlayers()
    .then(function (players) {
      setup.players = players;
    });

  setup.update = function () {
    ConfigService
      .updatePlayers(setup.players)
      .then(function (players) {
        setup.status = 'OK!';
      })
      .catch(function () {
        setup.status = 'Race is running!';
      });
  };

});