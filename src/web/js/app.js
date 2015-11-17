angular.module('GHX9', [])

.controller('MainCtrl', ['$scope', '$interval', '$http', function($scope, $interval, $http){

  var TIME_REFRESH_INTERVAL = 60000;

  $scope.isRunning = false;
  $scope.lastUpdated = '';
  $scope.commits = [];

  $scope.start = function() {
    pooling();
    $interval(pooling, TIME_REFRESH_INTERVAL);
  }


  function pooling (){

    if ($scope.isRunning === false) {
      $scope.isRunning = true;

      $http.get('/commit')
        .then(function(resp){
          //[] i.avatar_url, i.url_fork, i.usuario, i.requer_atencao, i.ultimo_commit.timestamp, i.ultimo_commit.url, i.ultimo_commit.mensagem

          $scope.commits = resp.data;
          $scope.lastUpdated = new Date().toLocaleString('pt-BR');
          $scope.isRunning = false;
        },function(err){

        });
    }
  }

}]);
