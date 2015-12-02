angular.module('raceApp').factory('ControllerHelper', function () {
  function within(scope, action) {
    scope.$apply(function () {
      action();
    });
  }

  return {
    within: within
  };
});