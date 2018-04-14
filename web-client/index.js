angular.module('myApp', ['ngRoute','ngResource','greenboxModule'])
.controller('myCtrl', function($scope, $http, $resource, $timeout) {

  var greenboxResource = $resource('http://localhost:3000/greenbox/:boxId', {boxId:'@id'});
  var userResource = $resource('http://localhost:3000/user/:userId', {userId:'@id'});
  var greenboxOptions = $resource('http://localhost:3000/plantType/:userId', {userId:'@id'});

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
    console.log('saving:'+JSON.stringify(box))
      greenboxResource.save({boxId:$scope.userId}, JSON.stringify(box), function(response) {

      });
  }

  $scope.getGreenboxOptions = function() {
      greenboxOptions.query({userId:$scope.userId}, function(response) {
        if(response) {
          console.log('got back populated box list of: '+JSON.stringify(response))
          $scope.populatedBoxList = response;
          // $scope.populatedBoxList.push({'name':'Other'})
        }
      })
  }

  $scope.updateGreenboxOptions = function(type) {
    greenboxOptions.save({userId:$scope.userId}, JSON.stringify(type), function(response) {

    });
  }

  $scope.getUser();
  $scope.getGreenboxOptions();
});
