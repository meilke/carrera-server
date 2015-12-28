angular.module('raceApp').controller('SetupController', function (ConfigService) {

  var setup = this;
  setup.players = [];
  setup.originalPlayers = [];

  ConfigService
    .getPlayers()
    .then(function (players) {
      setup.players = players;
      setup.originalPlayers = players;
    });

  setup.reset = function () {
    setup.players = setup.originalPlayers;
  };

  setup.update = function () {
    ConfigService
      .updatePlayers(setup.players)
      .then(function (players) {
        setup.originalPlayers = setup.players;
        setup.status = 'OK!';
      })
      .catch(function () {
        setup.status = 'Race is running!';
      });
  };

});