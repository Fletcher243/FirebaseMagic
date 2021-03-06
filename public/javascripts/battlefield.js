angular.module('cardeck', ['firebase'])
.controller('BattleCtrl', [
  '$scope','$http','$firebaseArray',
  function($scope,$http, $firebaseArray) {

    $scope.deckFields = ['battlefield', 'lands', 'library', 'graveyard', 'exile', 'extras', 'hand']

    $scope.battlefield = [];
    $scope.cardsForPlayer = {};
    $scope.showForPlayer = {};

    $scope.showCheckboxes = false;
    $scope.flipOnDraw = false;

    $scope.attaching = null;
    $scope.activeCard = null;
    $scope.activeCardField = '';
    $scope.activeCardPlayer = '';

    $scope.moveLocation = 'hand';
    $scope.playerOrder = [];
    $scope.tokenCopies = 1;

    firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if (user) {
        let battlefieldRef = firebase.database().ref('game')
        $scope.battlefield = $firebaseArray(battlefieldRef)
        let playerOrder = [];
        let leftovers = [];
        $scope.battlefield.$loaded().then(function() {
          $scope.battlefield.forEach(function(player) {
            $scope.showForPlayer[player.$id] = {
              hand: player.$id == user.uid,
              battlefield: true,
              library: false,
              graveyard: false,
              exile: false,
              extras: false,
              lands: true
            }
            if(player.$id == $scope.user.uid || playerOrder.length) {
              playerOrder.push(player.$id)
            } else {
              leftovers.push(player.$id)
            }
            $scope.cardsForPlayer[player.$id] = {}
            $scope.deckFields.forEach(function(field) {
              $scope.cardsForPlayer[player.$id][field] = $firebaseArray(firebase.database().ref(`game/${player.$id}/${field}`))
            });
          });
          $scope.playerOrder = playerOrder.concat(leftovers)
        }).catch(function(error) {
          console.log('Error:', error);
        });
        $scope.$apply();
      } else {
        location.href = '../'
      }
    });

    $scope.orderFunction = function(player) {
      return $scope.playerOrder.indexOf(player.$id)
    }

    const DEFAULT_LOCATIONS = {
      'hand': 'battlefield',
      'battlefield': 'graveyard',
      'lands': 'graveyard',
      'extras': 'battlefield',
    }

    getDefaultLocation = function() {
      if($scope.activeCard.type_line.includes('Land') && $scope.activeCardField == 'hand'){
        return 'lands'
      }
      return DEFAULT_LOCATIONS[$scope.activeCardField] || 'hand'
    }

    $scope.clickGameCard = function(card, player, field) {
      if(!card.$id) {
        return;
      }
      else if($scope.attaching != null) {
        if(field != 'battlefield'){
          console.log('I do not think there is a reason to attach to something outside the battlefield. If you really think there is please open an issue')
          return
        }
        $scope.attachCard(card, player.$id)
        $scope.attaching = null;
        $scope.activeCardField = '';
        $scope.activeCardPlayer = '';
      } else if($scope.activeCard) {
        $scope.activeCard = null;
        $scope.activeCardField = '';
        $scope.activeCardPlayer = '';
      } else {
        $scope.activeCard = card;
        $scope.activeCardField = field;
        $scope.activeCardPlayer = player.$id;
        $scope.moveLocation = getDefaultLocation()
      }
    }

    $scope.changeCounters = function(add) {
      let card = $scope.activeCard
      const path = `game/${$scope.activeCardPlayer}/${$scope.activeCardField}/${card.$id}`
      card.counters = (card.counters || 0) + (add ? 1 : -1)
      firebase.database().ref(path).update({counters: card.counters})
    }

    $scope.changeCard = function(attribute, card = $scope.activeCard, playerId = $scope.activeCardPlayer, field = $scope.activeCardField) {
      const path = `game/${playerId}/${field}/${card.$id}`
      card[attribute] = !card[attribute]
      firebase.database().ref(path).update({[attribute]: card[attribute]})
    }

    $scope.attachCard = function(card, playerId) {
      const path = `game/${playerId}/battlefield/${card.$id}`
      if(!card.attached_cards) {
        card.attached_cards = []
      }
      let attach = $scope.attaching
      const id = attach.$id
      if(attach.hasOwnProperty('$id')) delete attach.$id
      if(attach.hasOwnProperty('$priority')) delete attach.$priority
      attach.playerId = $scope.activeCardPlayer
      card.attached_cards.push(attach)
      firebase.database().ref(path).update({attached_cards: JSON.parse(angular.toJson(card.attached_cards))})
      attach.$id = id
      delete attach.playerId
      $scope.removeCard($scope.attaching, $scope.activeCardPlayer, $scope.activeCardField)
    }

    $scope.startAttaching = function() {
      $scope.attaching = $scope.activeCard;
      $scope.activeCard = null;
    }

    $scope.cancelAttaching = function() {
      $scope.attaching = null;
      $scope.activeCardField = '';
      $scope.activeCardPlayer = '';
    }

    $scope.moveCard = function() {
      if($scope.activeCard.type_line.includes('Token')) {
        if($scope.activeCardField === 'battlefield') {
          $scope.removeCard($scope.activeCard, $scope.activeCardPlayer, $scope.activeCardField)
        } else if($scope.activeCardField === 'extras') {
          for(let a = 0; a < $scope.tokenCopies; a++){
            $scope.addCard($scope.activeCard, $scope.user.uid, 'battlefield')
          }
        }
      } else {
        $scope.removeCard($scope.activeCard, $scope.activeCardPlayer, $scope.activeCardField)
        $scope.addCard($scope.activeCard, $scope.user.uid, $scope.moveLocation)
      }
      $scope.activeCard = null;
      $scope.activeCardField = '';
      $scope.activeCardPlayer = '';
    }

    $scope.addCard = function(card, playerId, field) {
      const addPath = `game/${playerId}/${field}`
      const addRef = firebase.database().ref(addPath).push();
      const id = card.$id
      if(card.hasOwnProperty('$id')) delete card.$id
      if(card.hasOwnProperty('$priority')) delete card.$priority
      if(card.hasOwnProperty('$$hashKey')) delete card.$$hashKey
      if(card.tapped) card.tapped = !card.tapped
      addRef.set(card)
      card.$id = id
    }

    $scope.changeLife = function(player, life) {
      const path = `game/${player.$id}`
      let playerRef = firebase.database().ref(path)
      playerRef.update({life: player.life + life})
    }

    $scope.untapAll = function() {
      $scope.cardsForPlayer[$scope.user.uid].battlefield.forEach(function(card) {
        if (card.tapped) $scope.changeCard('tapped', card, $scope.user.uid, 'battlefield')
      })
      $scope.cardsForPlayer[$scope.user.uid].lands.forEach(function(card) {
        if (card.tapped) $scope.changeCard('tapped', card, $scope.user.uid, 'lands')
      })
    }

    $scope.unattachAll = function(leaveOnBattlefield, card = $scope.activeCard, playerId = $scope.activeCardPlayer, field = $scope.activeCardField, removeActive = true) {
      if(card.hasOwnProperty('attached_cards')){
        card.attached_cards.forEach(function(card) {
          let putField = (card.type_line.includes('Aura')) && !leaveOnBattlefield ? 'graveyard' : 'battlefield'
          $scope.addCard(card, card.playerId, putField)
        });
        delete card.attached_cards;
        const path = `game/${playerId}/${field}/${card.$id}/attached_cards`
        firebase.database().ref(path).remove().then(function() {
          console.log("Unattached all!")
        });
        if(removeActive) {
          $scope.activeCard = null;
          $scope.activeCardField = '';
          $scope.activeCardPlayer = '';
        }
      }
    }

    $scope.removeCard = function(card, playerId, field) {
      const removePath = `game/${playerId}/${field}/${card.$id}`
      $scope.unattachAll(false, card, playerId, field, false)
      firebase.database().ref(removePath).remove().then(function() {
        $scope.cardsForPlayer[playerId][field] = $firebaseArray(firebase.database().ref(`game/${playerId}/${field}`))
        $scope.cardsForPlayer[playerId][field].$loaded().then(function() {
          console.log("Loaded");
        });
      });
    }

    $scope.drawCard = function(flip) {
      let library = $scope.cardsForPlayer[$scope.user.uid].library
      let card = library[Math.floor(Math.random() * library.length)]
      $scope.removeCard(card, $scope.user.uid, 'library')
      if($scope.flipOnDraw) card.flipped = !card.flipped
      $scope.addCard(card, $scope.user.uid, 'hand')
    }

    $scope.passTurn = function() {
      let activePlayerId = null
      $scope.battlefield.forEach(function(player) {
        if(player.active){
          activePlayerId = player.$id
        }
      })
      if(!activePlayerId){
        activePlayerId = $scope.playerOrder[Math.floor(Math.random() * $scope.playerOrder.length)]
        let path = `game/${activePlayerId}`
        firebase.database().ref(path).update({'active': true})
      } else {
        if(activePlayerId != $scope.playerOrder[0]){
          console.log("It isn't even your turn!")
        }
        else if($scope.playerOrder[1]){
          playerPath = `game/${$scope.playerOrder[0]}`
          otherPlayerPath = `game/${$scope.playerOrder[1]}`
          firebase.database().ref(playerPath).update({'active':false})
          firebase.database().ref(otherPlayerPath).update({'active':true})
        }
      }
    }

    $scope.getImage = function(card) {
      if(!card) return
      if(card.hasOwnProperty('image_uris')) {
        if(card.flipped){
          return '/Images/card_back.jpg'
        }
        return card.image_uris.normal
      }
      if(card.hasOwnProperty('card_faces')) {
        const face = card.flipped ? 1 : 0;
        return card.card_faces[face].image_uris.normal
      }
    }

    $scope.capitalize = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }
]);
