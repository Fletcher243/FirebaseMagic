angular.module('cardeck', ['firebase'])
.controller('MainCtrl', [
  '$scope','$http',
  function($scope,$http){

    $scope.logButton = 'Login';
    $scope.logged = false;

    firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if (user) {
        $scope.logged = true;
        $scope.logButton = 'Logout'
        $scope.$apply();
      } else {
        $scope.nameofthatbutton = 'Login';
        $scope.$apply();
      }
    });

    $scope.logout = function() {
      if(!$scope.logged) {
        let provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
      } else {
        $scope.logged = false;
        $scope.logButton = 'Login';
        firebase.auth().signOut();
      }
    }
  }
]);
