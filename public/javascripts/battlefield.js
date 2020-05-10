angular.module('cardeck', ['firebase'])
.controller('BattleCtrl', [
  '$scope','$http','$firebaseArray',
  function($scope,$http, $firebaseArray){

    $scope.deckFields = ['battlefield', 'lands', 'library', 'graveyard', 'exile', 'extras', 'hand']
    $scope.moreOptions = ['attach', 'unattach']
    $scope.allOptions = $scope.deckFields.concat($scope.moreOptions)

    $scope.clickOptions = ['Nothing','Move', 'Tap', 'Flip', 'Highlight', 'Add Counter', 'Remove Counter']
    $scope.clickAction = 'Nothing'

    $scope.battlefield = [];

    $scope.cardsForPlayer = {};
    $scope.showForPlayer = {};

    $scope.showCheckboxes = false;
    $scope.zoom = true;
    $scope.flipOnDraw = false;

    $scope.optionsCard = '';
    $scope.attaching = null;
    $scope.activeCard = {};

    firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if (user) {
        let battlefieldRef = firebase.database().ref('game')
        $scope.battlefield = $firebaseArray(battlefieldRef)
        $scope.battlefield.$loaded().then(function() {
          $scope.battlefield.forEach(function(player) {
          //$scope.battlefield.push({name:player.name, life: player.life, $id: player.$id})
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
        $scope.$apply();
      } else {
        location.href = '../'
      }
    });

  $scope.clickGameCard = function(card, player, field) {
    const id = card.$id
    if(!id) {
      return
    }
    if($scope.attaching != null) {
      if(field != 'battlefield'){
        console.log('I do not think there is a reason to attach to something outside the battlefield. If you reall think there is open an issue')
        return
      }
      $scope.attachCard(card, player.$id)
      $scope.attaching = null;
      return
    }
    if($scope.activeCard.$id == card.$id) {
      $scope.activeCard = {};
    } else {
      $scope.activeCard = card;
    }
    if($scope.clickAction === 'Add Counter'){
      const path = `game/${player.$id}/${field}/${card.$id}`
      card.counters = (card.counters || 0) + 1
      firebase.database().ref(path).update({counters: card.counters})
    }
    else if($scope.clickAction === 'Remove Counter') {
      const path = `game/${player.$id}/${field}/${card.$id}`
      card.counters = (card.counters || 0) - 1
      firebase.database().ref(path).update({counters: card.counters})
    }
    else if($scope.clickAction === 'Tap') {
      $scope.changeCard(card, player.$id, field, 'tapped')
    }
    else if($scope.clickAction === 'Highlight') {
      $scope.changeCard(card, player.$id, field, 'highlighted')
    }
    else if($scope.clickAction === 'Flip') {
      $scope.changeCard(card, player.$id, field, 'flipped')
    }
    else if($scope.clickAction === 'Move') {
      $scope.moveCard(card, player, field)
    }
  }

  $scope.changeCard = function(card, playerId, field, attribute) {
    const path = `game/${playerId}/${field}/${card.$id}`
    card[attribute] = !card[attribute]
    firebase.database().ref(path).update({[attribute]: card[attribute]})
  }

  $scope.attachCard = function(card, playerId) {
    const path = `game/${playerId}/battlefield/${card.$id}`
    if(!card.attached_cards) {
      card.attached_cards = []
    }
    let attach = $scope.attaching.card
    const id = attach.$id
    if(attach.hasOwnProperty('$id')) delete attach.$id
    if(attach.hasOwnProperty('$priority')) delete attach.$priority
    attach.playerId = $scope.attaching.playerId
    card.attached_cards.push(attach)
    firebase.database().ref(path).update({attached_cards: JSON.parse(angular.toJson(card.attached_cards))})
    attach.$id = id
    delete attach.playerId
    $scope.removeCard($scope.attaching.card, $scope.attaching.playerId, $scope.attaching.field)
  }

  $scope.moveCardAdvanced = function(card, player, field, moveLocation) {
    $scope.optionsCard = ''
    if($scope.deckFields.includes(moveLocation)) {
      $scope.addCard(card, $scope.user.uid, moveLocation)
      $scope.removeCard(card, player.$id, field)
      $scope.optionsCard = ''
    } else if(moveLocation === 'attach') {
      $scope.attaching = {
        card: card,
        playerId: player.$id,
        field: field
      }
    } else if(moveLocation === 'unattach') {
      $scope.unattachAll(card, player.$id, field, true)
    }
  }

  $scope.extraOptions = function(card) {
    $scope.optionsCard = card.$id
  }

  $scope.moveCard = function(card, player, field) {
    if(card.type_line.includes("Token")) {
      if(field === 'battlefield') {
        $scope.removeCard(card, player.$id, field)
      } else if(field === 'extras') {
        $scope.addCard(card, player.$id, 'battlefield')
      }
    } else {
      $scope.removeCard(card, player.$id, field)
      if(field === 'battlefield' || field === 'lands') {
        $scope.addCard(card, player.$id, 'graveyard')
      } else if(field === 'hand' || field === 'extras') {
        if(card.type_line.includes('Land')) {
          $scope.addCard(card, player.$id, 'lands')
        } else {
          $scope.addCard(card, player.$id, 'battlefield')
        }
      } else {
        $scope.addCard(card, player.$id, 'hand')
        console.log('I am not sure what you wanted, but since there is not a default location from there it was added to your hand')
      }
    }
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
      if (card.tapped) $scope.changeCard(card, $scope.user.uid, 'battlefield', 'tapped')
    })
    $scope.cardsForPlayer[$scope.user.uid].lands.forEach(function(card) {
      if (card.tapped) $scope.changeCard(card, $scope.user.uid, 'lands', 'tapped')
    })
  }

  $scope.unattachAll = function(card, playerId, field, leaveOnBattlefield = false) {
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
    }

  }

  $scope.removeCard = function(card, playerId, field) {
    const removePath = `game/${playerId}/${field}/${card.$id}`
    $scope.unattachAll(card, playerId, field)
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
}]);
