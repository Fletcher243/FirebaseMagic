angular.module('cardeck', ['firebase'])
.controller('BattleCtrl', [
  '$scope','$http','$firebaseArray',
  function($scope,$http, $firebaseArray){

    $scope.deckFields = ['battlefield', 'lands', 'library', 'graveyard', 'exile', 'extras', 'hand']

    $scope.battlefield = [];

    $scope.cardsForPlayer = {};
    $scope.addForPlayer = {};
    $scope.showForPlayer = {};
    $scope.activeCard;
    $scope.cardMoveInfo = {};
    $scope.defaultLocation = false;
    $scope.moving = false;

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
            $scope.cardsForPlayer[player.$id] = {}
            $scope.deckFields.forEach(function(field) {
              $scope.cardsForPlayer[player.$id][field] = $firebaseArray(firebase.database().ref(`game/${player.$id}/${field}`))
            });
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
    if($scope.clickAction === 'addcounter'){
      let path = `game/${player.$id}/${field}/${card.$id}`
      card.counters = (card.counters || 0) + 1
      firebase.database().ref(path).update({counters: card.counters})
      return
    }
    if($scope.clickAction === 'removecounter') {
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
    if($scope.clickAction === 'move') {
      $scope.moveCard(card, player, field)
      return
    }
  }

  $scope.changeCard = function(card, playerId, field, attribute) {
    let path = `game/${playerId}/${field}/${card.$id}`
    card[attribute] = !card[attribute]
    firebase.database().ref(path).update({[attribute]: card[attribute]})
  }

  $scope.attachCard = function(card, attach, playerId) {
    let path = `game/${playerId}/battlefield/${card.$id}`
    if(!card.attached_cards) {
      card.attached_cards = []
    }
    let id = attach.$id
    if(attach.hasOwnProperty('$id')) delete attach.$id
    if(attach.hasOwnProperty('$priority')) delete attach.$priority
    if(attach.hasOwnProperty('$$hashKey')) delete attach.$$hashKey
    card.playerId = playerId
    card.attached_cards.push(attach)
    firebase.database().ref(path).update({attached_cards: card.attached_cards})
    attach.$id = id
    delete attach.playerId
    $scope.removeCard()
  }

  $scope.moveCard = function(card, player, field, toField = true) {
    if(!toField && !$scope.moving) return
    if($scope.moving) {
      console.log("Moving")
      if(!toField) {
        $scope.addCard($scope.cardMoveInfo.card, player.$id, field);
        $scope.removeCard();
        $scope.moving = false;
      } else {
        if(field != 'battlefield'){
          console.log('You probably did not mean to do that...')
          return
        }
        $scope.attachCard(card, $scope.cardMoveInfo.card, $scope.cardMoveInfo.player.$id)
        $scope.moving = false;
      }
    } else if($scope.defaultLocation) {
      if(player.$id != $scope.user.uid) {
        return
      }
      if(card.type_line.includes("Token")) {
        if(field === 'battlefield') {
          $scope.removeCard(card, player.$id, field)
        } else if(field === 'extras') {
          $scope.addCard(card, player.$id, 'battlefield')
        }
      } else {
        if(field === 'battlefield') {
          $scope.addCard(card, player.$id, 'graveyard')
          $scope.removeCard(card, player.$id, 'battlefield')
        } else if(field === 'hand') {
          $scope.addCard(card, player.$id, 'battlefield')
          $scope.removeCard(card, player.$id, 'hand')
        } else if(field === 'extras') {
          $scope.addCard(card, player.$id, 'battlefield')
          $scope.removeCard(card, player.$id, 'extras')
        } else {
          $scope.cardMoveInfo = {
            card: card,
            player: player,
            field: field
          }
          console.log(card.name)
          $scope.moving = true
        }
      }
    } else {
      $scope.cardMoveInfo = {
        card: card,
        player: player,
        field: field
      }
      console.log($scope.cardMoveInfo)
      $scope.moving = true
      return
    }
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

  $scope.removeCard = function(card = $scope.cardMoveInfo.card, playerId = $scope.cardMoveInfo.player.$id, field = $scope.cardMoveInfo.field) {
    let removePath = `game/${playerId}/${field}/${card.$id}`
    if(card.hasOwnProperty('attached_cards')){
      card.attached_cards.forEach(function(card) {
        $scope.addCard(card, card.playerId, 'graveyard')
      });
      delete card.attached_cards;
    }
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
