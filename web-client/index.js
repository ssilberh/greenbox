angular.module('myApp', ['ngRoute','ngResource','greenboxModule'])
.controller('myCtrl', function($scope, $http, $resource, $timeout) {

  var mqttConnectionString = 'mqtt://localhost:4000';
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

  // Get initial state of screen. For now, comment out
  // $scope.getUser();
  // $scope.getGreenboxOptions();

  // Connect client to MQTT messaging so we don't need to poll application for new info
  // docs at https://github.com/mqttjs/MQTT.js
  client.on("connect", function(ack) {
    console.log("MQTT connected!");

  });

  client.on("message", function(topic, payload) {
    alert([topic, payload].join(": "));
    client.end();
  });

  // TODO: update options with name of real clientId
  var client = mqtt.connect(mqttConnectionString, { clientId: "stevenAndKatherine" });

  client.subscribe("mqtt/demo");

});
