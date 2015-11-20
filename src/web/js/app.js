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
            $scope.error = resp.data.desc;
          }
          else {
            $scope.error = null;
            $scope.repositories = resp.data;
          }

          $scope.lastUpdated = new Date().toLocaleString('pt-BR');
          $scope.isRunning = false;
        }, function(err) {
          $scope.error = err;
        });
    }
  };

}])
.filter('timestamp', function() {
  return function(pushedTimestamp) {
    if (pushedTimestamp.inHours > 24) {
      lastCommit = pushedTimestamp.inDays + " dias atrás";
    } else if (pushedTimestamp.inMinutes > 60) {
      lastCommit = pushedTimestamp.inHours + " hrs atrás";
    } else if (pushedTimestamp.inMinutes < 60) {
      lastCommit = pushedTimestamp.inMinutes + " min atrás";
    }

    return lastCommit;
  };
});
