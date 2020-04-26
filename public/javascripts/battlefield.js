angular.module('cardeck', ['firebase'])
.controller('BattleCtrl', [
  '$scope','$http','$firebaseArray',
  function($scope,$http, $firebaseArray){

    $scope.deckFields = ['battlefield', 'lands', 'library', 'graveyard', 'exile', 'extras', 'hand']

    $scope.battlefield = [];

    $scope.cardsForPlayer = {};
    $scope.addForPlayer = {};
    $scope.showForPlayer = {};

    $scope.logButton = 'Login';
    $scope.logged = false;
    $scope.clickAction = 'tap';
    $scope.showCheckboxes = false;

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
              exile: false,
              extras: false,
              lands: false
            }
            $scope.showForPlayer[player.$id] = {
              hand: player.$id == user.uid,
              battlefield: true,
              library: false,
              graveyard: false,
              exile: false,
              extras: false,
              lands: true
            }
            $scope.cardsForPlayer[player.$id] = {
              hand: $firebaseArray(firebase.database().ref(`game/${player.$id}/hand`)),
              battlefield: $firebaseArray(firebase.database().ref(`game/${player.$id}/battlefield`)),
              library: $firebaseArray(firebase.database().ref(`game/${player.$id}/library`)),
              graveyard: $firebaseArray(firebase.database().ref(`game/${player.$id}/graveyard`)),
              exile: $firebaseArray(firebase.database().ref(`game/${player.$id}/exile`)),
              extras: $firebaseArray(firebase.database().ref(`game/${player.$id}/extras`))
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
    let id = card.$id
    if(!id) {
      return
    }
    if($scope.clickAction === 'tap') {
      let path = `game/${player.$id}/${field}/${id}`
      card.tapped = !card.tapped
      let tapped = firebase.database().ref(path).update({tapped: card.tapped});
      return
    }
    if($scope.clickAction === 'flip') {
      let path = `game/${player.$id}/${field}/${id}`
      card.flipped = !card.flipped
      let flipped = firebase.database().ref(path).update({flipped: card.flipped});
      return
    }
    if($scope.clickAction.includes('add')) {
      $scope.battlefield.forEach(function(player) {
        $scope.deckFields.forEach(function(addField) {
          if($scope.addForPlayer[player.$id][addField]) {
            let addPath = `game/${player.$id}/${addField}`
            let addRef = firebase.database().ref(addPath).push();
            if(card.hasOwnProperty('$id')) delete card.$id
            if(card.hasOwnProperty('$priority')) delete card.$priority
            if(card.hasOwnProperty('$$hashKey')) delete card.$$hashKey
            if($scope.clickAction.includes('flip')) card.flipped = !card.flipped
            addRef.set(card)
          }
        });
      });
    }
    if($scope.clickAction.includes('remove')) {
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
      if(card.flipped){
        return 'card_back.jpg'
      }
      return card.image_uris.normal
    }
    if(card.hasOwnProperty('card_faces')) {
      let face = card.flipped ? 1 : 0;
      return card.card_faces[face].image_uris.normal
    }
  }
}]);
