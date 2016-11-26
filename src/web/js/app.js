angular.module('GHX9', [ 'ngStorage' ])

.controller('MainCtrl', ['$scope', '$interval', '$http', '$localStorage', function($scope, $interval, $http, $localStorage) {

  var TIME_REFRESH_INTERVAL = 60000;

  $scope.isRunning = false;
  $scope.lastUpdated = '';
  $scope.repositories = [];
  $scope.error = null;

  $scope.start = function() {
    pooling();
    $interval(pooling, TIME_REFRESH_INTERVAL);
  };

  $scope.showAll = function($event) {
    $scope.repositories.forEach(function(rep) {
      rep.reviewed = false;
    })
    $localStorage.reviewedStudents = [];
    return $event.preventDefault();
  }

  $scope.hideAll = function($event) {
    $localStorage.reviewedStudents = $scope.repositories.map(function(rep) {
      return rep.reviewed = true, angular.copy(rep.user);
    }) || [];
    return $event.preventDefault();
  };

  $scope.toggleReviewed = function(rep, $event) {
    var reviewedStudents = $localStorage.reviewedStudents || [];
    rep.reviewed = !userHasBeenReviewed(rep.user);
    if (rep.reviewed) {
      reviewedStudents.push(rep.user);
    } else {
      // remover aluno da lista de revisados
      reviewedStudents.splice(reviewedStudents.findIndex(function(e) {
        return e === rep.user;
      }), 1);
    }
    $localStorage.reviewedStudents = reviewedStudents;
    return $event.preventDefault();
  };

  var userHasBeenReviewed = function(user) {
    var reviewedStudents = $localStorage.reviewedStudents || [];
    return $.inArray(user, reviewedStudents) > -1
  }

  var pooling = function() {
    if ($scope.isRunning === false) {
      $scope.isRunning = true;
      
      $http.get('/commit')
        .then(function(resp){
          $scope.error = null;
          $scope.repositories = resp.data.map(function(e) {
            return e.reviewed = userHasBeenReviewed(e.user), e;
          });
          $scope.lastUpdated = new Date();
          $scope.isRunning = false;
        }, function(err) {
          $scope.error = err.data;
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
