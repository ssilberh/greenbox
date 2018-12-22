angular.module('myApp', ['ngRoute','ngResource','greenboxModule'])
.controller('myCtrl', function($scope, $http, $resource, $timeout) {

  var mqttConnectionString = 'mqtt://localhost:4000';
  var greenboxResource = $resource('http://localhost:3000/users/:userId/boxes/:boxId', {userId:'@id', boxId:'@box'});
  var userResource = $resource('http://localhost:3000/users/:userId', {userId:'@id'});
  var greenboxOptions = $resource('http://localhost:3000/users/:userId/plantTypes', {userId:'@id'});

  $scope.userId = 123;
  $scope.boxes = [];

  $scope.getUser = function() {

    userResource.get({userId:$scope.userId}, function(response) {
      // get the boxes from the response message to display on the UI
      if(response && response.boxes) {
        console.log('got response for user:'+JSON.stringify(response.boxes));

        // get box from boxId
        var boxes = [];
        for(var index = 0; index < response.boxes.length; index++) {
          // put in closure so we can use the i var to debug in our callback
          (function(){
            var i = index;
            var box = response.boxes[i];
            greenboxResource.get({boxId:box, userId:$scope.userId}, function(response) {
              console.log('for boxid '+box+' i:'+i +' '+JSON.stringify(response));
              boxes.push(response)
            });
          })();
        }

        $scope.boxes = boxes;
      }
    });
  }

  $scope.updateBox = function(box) {
    console.log('saving:'+JSON.stringify(box))
      greenboxResource.save({boxId:$scope.userId, userId:$scope.userId}, JSON.stringify(box), function(response) {

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

  // Get initial state for a fake user
  $scope.getGreenboxOptions();
  $scope.getUser();

  // Connect client to MQTT messaging so we don't need to poll application for new info
  // docs at https://github.com/mqttjs/MQTT.js

  // TODO: update options with name of real clientId
  var client = mqtt.connect(mqttConnectionString, { clientId: "stevenAndKatherine" });

  client.on("connect", function(ack) {
    console.log("MQTT connected!");
  });

  client.on("message", function(topic, payload) {
    alert([topic, payload].join(": "));
    client.end();
  });

  client.subscribe("mqtt/demo");

});
