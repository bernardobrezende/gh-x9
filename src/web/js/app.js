angular.module('GHX9', [])

.controller('MainCtrl', ['$scope', '$interval', '$http', function($scope, $interval, $http){

  var TIME_REFRESH_INTERVAL = 60000;

  $scope.isRunning = false;
  $scope.lastUpdated = '';
  $scope.repositories = [];
  $scope.error = null;

  $scope.start = function() {
    pooling();
    $interval(pooling, TIME_REFRESH_INTERVAL);
  };

  function pooling () {
    if ($scope.isRunning === false) {
      $scope.isRunning = true;

      $http.get('/commit')
        .then(function(resp){
          console.log(resp);
          if(resp.data.error) {
            $scope.error = resp.data;
          }
          else {
            $scope.error = null;
            $scope.repositories = resp.data;
          }

          $scope.lastUpdated = new Date();
          $scope.isRunning = false;
        }, function(err) {
          $scope.error = err;
        });
    }
  }

}])
.filter('timestamp', function() {
  return function(pushedTimestamp) {
    var lastCommit;
    if (pushedTimestamp.inDays > 1) {
      lastCommit = String.format("{0} dias atrás", pushedTimestamp.inDays);
    } else if (pushedTimestamp.inDays === 1 ) {
      lastCommit = String.format("1 dia atrás");
    } else if (pushedTimestamp.inMinutes > 100) { // 01:40
      lastCommit = String.format("{0} hrs atrás", pushedTimestamp.inHours);
    } else if (pushedTimestamp.inMinutes > 40) { // 00:40
      lastCommit = "1 hr atrás";
    } else {
      lastCommit = String.format("{0} min atrás", pushedTimestamp.inMinutes);
    }
    return lastCommit;
  };
});
