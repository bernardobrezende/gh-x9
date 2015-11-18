angular.module('GHX9', [])

.controller('MainCtrl', ['$scope', '$interval', '$http', function($scope, $interval, $http){

  var TIME_REFRESH_INTERVAL = 60000;

  $scope.isRunning = false;
  $scope.lastUpdated = '';
  $scope.commits = [];
  $scope.error = null;

  $scope.start = function() {
    pooling();
    $interval(pooling, TIME_REFRESH_INTERVAL);
  }


  function pooling (){

    if ($scope.isRunning === false) {
      $scope.isRunning = true;

      $http.get('/commit')
        .then(function(resp){
          
          if(resp.error) {
            $scope.error = resp.error.desc;
          }
          else {
            $scope.error = null;
            $scope.commits = resp.data;
          }

          $scope.lastUpdated = new Date().toLocaleString('pt-BR');
          $scope.isRunning = false;
        }, function(err) {
          $scope.error = err;
        });
    }
  }

}]);
