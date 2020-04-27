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
    $scope.flip = false;
    $scope.zoom = true;

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
              battlefield: player.$id == user.uid,
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
        location.href='../'
      }
    });

  $scope.clickGameCard = function(card, player, field) {
    let id = card.$id
    if(!id) {
      return
    }
    if($scope.clickAction === 'morecounter'){
      let path = `game/${player.$id}/${field}/${card.$id}`
      card.counters = (card.counters || 0) + 1
      firebase.database().ref(path).update({counters: card.counters})
      return
    }
    if($scope.clickAction === 'lesscounter') {
      let path = `game/${player.$id}/${field}/${card.$id}`
      card.counters = (card.counters || 0) - 1
      firebase.database().ref(path).update({counters: card.counters})
    }
    if($scope.clickAction === 'tap') {
      $scope.changeCard(card, player.$id, field, 'tapped')
      return
    }
    if($scope.clickAction === 'highlight') {
      $scope.changeCard(card, player.$id, field, 'highlighted')
      return
    }
    if($scope.clickAction === 'flip') {
      $scope.changeCard(card, player.$id, field, 'flipped')
      return
    }
    if($scope.clickAction.includes('remove')) {
      $scope.removeCard(card, player.$id, field)
     }
    if($scope.clickAction.includes('add')) {
      $scope.battlefield.forEach(function(player) {
        $scope.deckFields.forEach(function(addField) {
          if($scope.addForPlayer[player.$id][addField]) {
            $scope.addCard(card, player.$id, addField)
          }
        });
      });
    }
  }

  $scope.changeCard = function(card, playerId, field, attribute) {
    let path = `game/${playerId}/${field}/${card.$id}`
    card[attribute] = !card[attribute]
    firebase.database().ref(path).update({[attribute]: card[attribute]})
  }
  $scope.addCard = function(card, playerId, field) {
    console.log(card)
	  let addPath = `game/${playerId}/${field}`
    let addRef = firebase.database().ref(addPath).push();
    let id = card.$id
    if(card.hasOwnProperty('$id')) delete card.$id
    if(card.hasOwnProperty('$priority')) delete card.$priority
    if(card.hasOwnProperty('$$hashKey')) delete card.$$hashKey
    addRef.set(card)
    console.log(card)
    card.$id = id
  }

  $scope.removeCard = function(card, playerId, field) {
    let removePath = `game/${playerId}/${field}/${card.$id}`
    firebase.database().ref(removePath).remove().then(function() {
      $scope.cardsForPlayer[playerId][field] = $firebaseArray(firebase.database().ref(`game/${playerId}/${field}`))
      $scope.cardsForPlayer[playerId][field].$loaded().then(function() {
        console.log("Loaded");
    console.log($scope.cardsForPlayer[$scope.user.uid].library.length)
      });
    });
  }

  $scope.drawCard = function(flip) {
    let library = $scope.cardsForPlayer[$scope.user.uid].library
    let card = library[Math.floor(Math.random() * library.length)]
    console.log($scope.cardsForPlayer[$scope.user.uid].library.length)
    $scope.removeCard(card, $scope.user.uid, 'library')
    $scope.addCard(card, $scope.user.uid, 'hand')
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
