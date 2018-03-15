angular.module('greenboxModule',[])
.directive('greenbox', function() {

  //scope.editingEnabled = true;

  return {
    scope: true,
    templateUrl: 'components/greenbox.html',
    controller: ['$scope', function(scope) {
      scope.editingEnabled = false;

      var data = {
        labels : ["January","February","March","April","May","June","July"],
        datasets : [
          {
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            data : [65,59,90,81,56,55,40]
          },
          {
            fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
            data : [28,48,40,19,96,27,100]
          }
        ]
      }

      scope.temperatureGraphOneYear = data;

      scope.enableEditing = function(box) {
        scope.editingEnabled = true;
      }

      scope.doneEditing = function(box) {
        scope.editingEnabled = false;
        scope.updateBox(box);
      }
    }]
  }
})
