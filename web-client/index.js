angular.module('myApp', ['ngRoute','ngResource'])
.controller('myCtrl', function($scope, $http, $resource) {

  var greenboxResource = $resource('http://localhost:3000/greenbox/:boxId', {boxId:'@id'});

  $scope.getBox = function() {
    console.log("Getting box");
    greenboxResource.get({boxId:123}, function(response) {
      
        $scope.greeting = response.data.content;
    });
  }

});
