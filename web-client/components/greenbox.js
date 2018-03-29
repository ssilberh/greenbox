angular.module('greenboxModule', ['ngSanitize', 'ui.select'])
.directive('greenbox', function() {

  //scope.editingEnabled = true;

  return {
    scope: true,
    templateUrl: 'components/greenbox.html',
    controller: ['$scope', function(scope, timeout) {

      // Calculate what the temperature graph looks like over a given time period
      var chartData = function(startDay, endDay) {
        if(startDay >= endDay) {
          return;
        }

        var ret = [];
        var avgYearlyTemp = (parseInt(scope.box.maxYearly) + parseInt(scope.box.minYearly)) / 2;

        for(var i = 0; i < endDay - startDay; i++) {
          ret[i] = {};
          var day = i + startDay;

          ret[i].x = day;
          ret[i].y = ((parseInt(scope.box.maxYearly) - avgYearlyTemp)
              * Math.sin(day * 2 * Math.PI / 365)
              + parseInt(scope.box.dailyDiff) * Math.sin(day * 2 * Math.PI)
              + avgYearlyTemp).toFixed(3);
        }
        return ret;
      }

      // Calculate hourly tempertaure array on a given day
      var chartDayHourly = function(day) {
        if(day < 0 || day > 364) {
          return;
        }

        var ret = [];
        var labels = [];

        // loop over 24 hour increment
        for(var i = 0; i < 24; i++) {
          ret[i] = {};
          var hour = day + i / 24;
          var avgYearlyTemp = (parseInt(scope.box.maxYearly) + parseInt(scope.box.minYearly)) / 2;
          ret[i].x = i;
          ret[i].y = ((parseInt(scope.box.maxYearly) - avgYearlyTemp)
              * Math.sin(hour * 2 * Math.PI / 365)
              + parseInt(scope.box.dailyDiff) * Math.cos(hour * 2 * Math.PI - Math.PI)
              + avgYearlyTemp).toFixed(1);
          labels[i] = i;
        }
        return {"data":ret, "labels":labels};
      }

      var renderGraphs = function() {
        // TODO: create common controller for all line graphs
        var idName = scope.box.boxId + "Id";
        var hourlyIdName = scope.box.boxId + "DayId";

        var element = document.getElementById(idName);
        var hourlyElement = document.getElementById(hourlyIdName)

        if (element) {
          var yearlyData = chartData(0,365);
          var hourlyData = chartDayHourly(100);

          var dayLabels = [];
          for(var i = 0; i < yearlyData.length; i++) {
            dayLabels[i] = yearlyData[i].x;
          }

          var ctx = element.getContext('2d');
          var hourlyCtx = hourlyElement.getContext('2d');
          var myChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dayLabels,
              datasets: [{
                label: 'My First dataset',
                borderColor: "rgba(75, 192, 192, 1)",
                data: yearlyData,
                fill: false
              }]
            },
            options:{
              scales: {
                xAxes: [{
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: 'Day of Year'
                  },
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20
                  }
                }],
                yAxes: [{
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: 'Temperature (°F)'
                  }
                }]
              },
              legend: {
                display: false
              }
            }
            }
          );

          var hourlyChart = new Chart(hourlyCtx, {
            type: 'line',
            data: {
              labels: hourlyData.labels,
              datasets: [{
                label: 'Temperature (°F)',
                borderColor: "rgba(75, 192, 192, 1)",
                data: hourlyData.data,
                fill: false
              }]
            },
            options:{
              scales: {
                xAxes: [{
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: 'Hour of Day'
                  },
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20
                  }
                }],
                yAxes: [{
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: 'Temperature (°F)'
                  }
                }]
              },
              legend: {
                display: false
              }
            }
            }
          );

          myChart.update();
          hourlyChart.update();
        }
      }

      // Order of page load:
      // 1. <canvas> gets assigned an Id, which is bound ot the boxId
      //    of a specific directive's box.
      // 2. This <canvas> id must be assigned data to make the graph show.

      // We therefore must wait for the DOM to fully load (angular.element)
      // before getting the <canvas> from the document and applying our data
      angular.element(function() {
        renderGraphs();
      });

      scope.editingEnabled = false;
      scope.userDefiningValues = false;

      scope.enableEditing = function() {
        scope.editingEnabled = true;
      }

      scope.doneEditing = function() {

        // clean up state when we are done editing
        scope.editingEnabled = false;
        scope.box.name = scope.selectedBoxType.selected.name;

        // if we created a new box type, push the new type to the server
        scope.updateGreenboxOptions(scope.selectedBoxType.selected)

        // then, update the box to tie it to the new type
        scope.updateBox(scope.box);

        // update graphs after we update parameters
        renderGraphs();
      }

      var boxDetails;
      for(var predefinedBoxIdx = 0; predefinedBoxIdx < scope.populatedBoxList.length; predefinedBoxIdx++) {
        if(scope.populatedBoxList[predefinedBoxIdx].name == scope.box.name) {
          boxDetails = scope.populatedBoxList[predefinedBoxIdx];
          break;
        }
      }
      scope.selectedBoxType = {};
      scope.selectedBoxType.selected = boxDetails;

      scope.boxColor = ["Terrestrial", "Aquatic"];

      // scope.selectedBox.selected = scope.box;
      scope.$watch('selectedBoxType.selected', function() {

        if(scope.selectedBoxType && scope.selectedBoxType.selected) {

          // If we are defining our own box values, allow textboxes to define this
          // to show up.
          if(scope.selectedBoxType.selected.name == "Other") {
            scope.userDefiningValues = true;
          }
          else {
            scope.userDefiningValues = false;

            var entry;
            for(var i = 0; i < scope.populatedBoxList.length; i++) {
              if(scope.populatedBoxList[i].name == scope.selectedBoxType.selected.name) {
                entry = scope.populatedBoxList[i];
                break;
              }
            }

            if(entry) {
              scope.box.maxYearly = entry.maxYearly;
              scope.box.minYearly = entry.minYearly;
              scope.box.dailyDiff = entry.dailyDiff;
            }
            else{
              console.log('DIDNT FIND '+ scope.selectedBoxType.selected.name+' in '+JSON.stringify(scope.populatedBoxList))
            }
          }
        }
      });

    }]
  }
})
