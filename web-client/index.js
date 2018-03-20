angular.module('myApp', ['ngRoute','ngResource','greenboxModule'])
.controller('myCtrl', function($scope, $http, $resource, $timeout) {

  var greenboxResource = $resource('http://localhost:3000/greenbox/:boxId', {boxId:'@id'});
  var userResource = $resource('http://localhost:3000/user/:userId', {userId:'@id'});
  var greenboxOptions = $resource('http://localhost:3000/boxes/predefined');

  $scope.userId = 123;
  $scope.boxes = [];

  $scope.getUser = function() {

    userResource.get({userId:$scope.userId}, function(response) {
      // get the boxes from the response message to display on the UI
      if(response && response.boxes) {
        $scope.boxes = response.boxes;
      }
    });
  }

  $scope.updateBox = function(box) {
      greenboxResource.save({boxId:$scope.userId}, JSON.stringify(box), function(response) {

      });
  }

  $scope.getGreenboxOptions = function() {
      greenboxOptions.query(function(response) {
        if(response) {
          $scope.populatedBoxList = response;
        }
      })
  }

  $scope.getUser();
  $scope.getGreenboxOptions();
});
