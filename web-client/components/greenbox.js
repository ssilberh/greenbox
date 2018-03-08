angular.module('greenboxModule',[])
.directive('greenbox', function() {

  //scope.editingEnabled = true;

  return {
    scope: true,
    templateUrl: 'components/greenbox.html',
    controller: ['$scope', function(scope) {
      scope.editingEnabled = false;

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
