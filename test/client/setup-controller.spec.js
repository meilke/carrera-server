'use strict';

describe('SetupController', function() {

  var $scope, $httpBackend, createController,
    players = [{name: 'Paul'}, {name: 'Simon'}];

  beforeEach(function() {
    module('raceApp');
  });

  beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $httpBackend
      .when('GET', '/api/players')
      .respond(players);
    createController = function () {
      return $controller('SetupController', { $scope: $scope });
    };
  }));

  it('asks the backend for the player data', function () {
    $httpBackend.expectGET('/api/players');
    var controller = createController();
    $httpBackend.flush();
  });

  it('reveals the player data', function () {
    var controller = createController();
    $httpBackend.flush();
    expect(controller.players[0].name).toBe('Paul');
    expect(controller.players[1].name).toBe('Simon');
  });

  it('updates the player data', function () {
    var controller = createController();
    $httpBackend.flush();
    $httpBackend
      .expectPUT('/api/players', [{name: 'Art'}, {name: 'Simon'}])
      .respond(500);
    controller.players[0].name = 'Art';
    controller.update();
    $httpBackend.flush();
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});