angular.module('cardeck', ['firebase'])
.controller('BattleCtrl', [
  '$scope','$http','$firebaseArray',
  function($scope,$http, $firebaseArray){

    deckFields = ['hand', 'battlefield', 'library', 'graveyard', 'exile']

    $scope.battlefield = [];

    $scope.cardsForPlayer = {};
    $scope.addForPlayer = {};
    $scope.showForPlayer = {};

    $scope.logButton = 'Login'
    $scope.logged = false;

    firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if (user) {
        let battlefieldRef = firebase.database().ref('game')
        let battlefieldArray = $firebaseArray(battlefieldRef)
        battlefieldArray.$loaded().then(function() {
          battlefieldArray.forEach(function(player) {
          $scope.battlefield.push({name:player.name, $id: player.$id})
          $scope.addForPlayer[player.$id] = {
              hand: false,
              battlefield: false,
              library: false,
              graveyrd: false,
              exile: false
            }
            $scope.showForPlayer[player.$id] = {
              hand: false,
              battlefield: true,
              library: true,
              graveyard: false,
              exile: false
            }
            $scope.cardsForPlayer[player.$id] = {
              hand: $firebaseArray(firebase.database().ref(`game/${player.$id}/hand`)),
              battlefield: $firebaseArray(firebase.database().ref(`game/${player.$id}/battlefield`)),
              library: $firebaseArray(firebase.database().ref(`game/${player.$id}/library`)),
              graveyard: $firebaseArray(firebase.database().ref(`game/${player.$id}/graveyard`)),
              exile: $firebaseArray(firebase.database().ref(`game/${player.$id}/exile`))
            }
          });
        }).catch(function(error) {
          console.log('Error:', error);
        });
        $scope.logged = true;
        $scope.logButton = 'Logout'
        $scope.$apply();
      } else {
        $scope.nameofthatbutton = 'Login';
        $scope.$apply();
      }
    });

  $scope.clickGameCard = function(card, player, field) {
    console.log(card)
    console.log(card.$id)
    console.log(card.name)
    let id = card.$id
    if(!id) { 
      return
    }
    let removeCard = false
    $scope.battlefield.forEach(function(player) {
      deckFields.forEach(function(addField) {
        if($scope.addForPlayer[player.$id][addField]) {
          let addPath = `game/${player.$id}/${addField}`
          let addRef = firebase.database().ref(addPath).push();
          if(card.hasOwnProperty('$id')) delete card.$id
          if(card.hasOwnProperty('$priority')) delete card.$priority
          if(card.hasOwnProperty('$$hashKey')) delete card.$$hashKey
          addRef.set(card)
          removeCard = true
        }
      });
    });
    if(removeCard) {
    let removePath = `game/${player.$id}/${field}/${id}`
      firebase.database().ref(removePath).remove().then(function() {
        $scope.cardsForPlayer[player.$id][field] = $firebaseArray(firebase.database().ref(`game/${player.$id}/${field}`))
        $scope.cardsForPlayer[player.$id][field].$loaded().then(function() {
          console.log("Loaded");
        });
      });
    }
  }

  $scope.getImage = function(card) {
    if(!card) return
    if(card.hasOwnProperty('image_uris')) {
      return card.image_uris.normal
    }
    if(card.hasOwnProperty('card_faces')) {
      return card.card_faces[0].image_uris.normal
    }
  }

  $scope.clearDisplay = function(){
    $scope.deckField = '';
    $scope.adding = false;
    if($scope.manage){
      $scope.manage = false;
      $scope.getDeck();
    } else {
      $scope.deckCards = [];
    }
    $scope.$apply();
  }
}]);
