angular.module('cardeck', ['firebase'])
.controller('MainCtrl', [
  '$scope','$http','$firebaseArray',
  function($scope,$http, $firebaseArray){

    $scope.searchResults = [];
    $scope.deckCards = [];
    $scope.decks = [];

    $scope.activeDeck;
    $scope.secondDeck;
    $scope.cardField = '';
    $scope.footerText = '';
    $scope.deckField = '';
    $scope.battlefield = [];

    $scope.addForPlayer = {};
    $scope.showForPlayer = {};

    $scope.nameofthatbutton = 'Login';
    $scope.logButton = 'Login'
    $scope.logged = false;
    $scope.adding = false;
    $scope.manage = true;
    $scope.addToSecondDeck = false;
    $scope.removeFromDeck = false;

    firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if (user) {
        firebase.database().ref('cards/').remove()
        firebase.database().ref(`users/${user.uid}`).update({
          username: user.displayName
        });

        let decksRef = firebase.database().ref().child(`users/${user.uid}/decks`);
        $scope.decks = $firebaseArray(decksRef);
        $scope.decks.$loaded().then(function() {
          if($scope.decks.length < 1){
            $scope.deckField = 'Default';
            $scope.addDeck();
          }
          let key = $scope.decks.$keyAt(0);
          $scope.activeDeck = $scope.decks.$getRecord(key);
          $scope.secondDeck = $scope.activeDeck
          $scope.clearDisplay()
        }).catch(function(error) {
          console.log('Error:', error);
        });
        let battlefieldRef = firebase.database().ref().child('game')
        $scope.battlefield = $firebaseArray(battlefieldRef)
        $scope.battlefield.$loaded().then(function() {
          $scope.battlefield.forEach(function(player) {
            $scope.addForPlayer[player.name] = {
              hand: false,
              battlefield: false,
              library: false,
              graveyrd: false,
              exile: false
            }
            $scope.showForPlayer[player.name] = {
              hand: false,
              battlefield: true,
              library: true,
              graveyard: false,
              exile: false
            }
          });
          $scope.$apply();
        }).catch(function(error) {
           console.log('Error:', error);
         });
        $scope.nameofthatbutton = 'Add Cards';
        $scope.logged = true;
        $scope.logButton = 'Logout'
        $scope.$apply();
      } else {
        $scope.nameofthatbutton = 'Login';
        $scope.$apply();
      }
    });
    $scope.nameDeck = function() {
    $scope.adding = true;
  }

  $scope.getForPlayer = function(player, field) {
    return $scope.battlefield.filter(function(item) {
      return item.$id == player.$id
    })[0][field] 
  }

  $scope.clickGameCard = function(card, player, field) {

  }

  $scope.getImage = function(card) {
    if(card.hasOwnProperty('image_uris')) {
      return card.image_uris.normal
    }
    if(card.hasOwnProperty('card_faces')) {
      return card.card_faces[0].image_uris.normal
    }
  }

  $scope.removeExtraFields = function(card) {
    if(card.hasOwnProperty('$$hashKey')) delete card.$$hashKey
    if(card.hasOwnProperty('arena_id')) delete card.arena_id
    if(card.hasOwnProperty('artist_ids')) delete card.artist_ids
    if(card.hasOwnProperty('booster')) delete card.booster
    if(card.hasOwnProperty('border_color')) delete card.border_color
    if(card.hasOwnProperty('collector_number')) delete card.collector_number
    if(card.hasOwnProperty('digital')) delete card.digital
    if(card.hasOwnProperty('edhrec_rank')) delete card.edhrec_rank
    if(card.hasOwnProperty('foil')) delete card.foil
    if(card.hasOwnProperty('frame')) delete card.frame
    if(card.hasOwnProperty('full_art')) delete card.full_art
    if(card.hasOwnProperty('games')) delete card.games
    if(card.hasOwnProperty('highres_image')) delete card.highres_image
    if(card.hasOwnProperty('illustration_id')) delete card.illustration_id
    if(card.hasOwnProperty('lang')) delete card.lang
    if(card.hasOwnProperty('image_uris.small')) delete card.image_uris.small
    if(card.hasOwnProperty('image_uris.png')) delete card.image_uris.png
    if(card.hasOwnProperty('image_uris.border_crop')) delete card.image_uris.border_crop
    if(card.hasOwnProperty('layout')) delete card.layout
    if(card.hasOwnProperty('legalities')) delete card.legalities
    if(card.hasOwnProperty('mtgo_foil_id')) delete card.mtgo_foil_id
    if(card.hasOwnProperty('mtgo_id')) delete card.mtgo_id
    if(card.hasOwnProperty('multiverse_ids')) delete card.multiverse_ids
    if(card.hasOwnProperty('nonfoil')) delete card.nonfoil
    if(card.hasOwnProperty('oracle_id')) delete card.oracle_id
    if(card.hasOwnProperty('oversized')) delete card.oversized
    if(card.hasOwnProperty('prices')) delete card.prices
    if(card.hasOwnProperty('prints_search_uri')) delete card.prints_search_uri
    if(card.hasOwnProperty('promo')) delete card.promo
    if(card.hasOwnProperty('purchase_uris')) delete card.purchase_uris
    if(card.hasOwnProperty('rarity')) delete card.rarity
    if(card.hasOwnProperty('released_at')) delete card.released_at
    if(card.hasOwnProperty('reprint')) delete card.reprint
    if(card.hasOwnProperty('reserved')) delete card.reserved
    if(card.hasOwnProperty('rulings_uri')) delete card.rulings_uri
    if(card.hasOwnProperty('scryfall_set_uri')) delete card.scryfall_set_uri
    if(card.hasOwnProperty('scryfall_uri')) delete card.scryfall_uri
    if(card.hasOwnProperty('set')) delete card.set
    if(card.hasOwnProperty('set_name')) delete card.set_name
    if(card.hasOwnProperty('set_search_uri')) delete card.set_search_uri
    if(card.hasOwnProperty('set_type')) delete card.set_type
    if(card.hasOwnProperty('set_uri')) delete card.set_uri
    if(card.hasOwnProperty('story_spotlight')) delete card.story_spotlight
    if(card.hasOwnProperty('tcgplayer_id')) delete card.tcgplayer_id
    if(card.hasOwnProperty('textless')) delete card.textless
    if(card.hasOwnProperty('uri')) delete card.uri
    if(card.hasOwnProperty('variation')) delete card.variation
    return card
  }

  $scope.addCard = function(card, secondDeck = false){
    let user = firebase.auth().currentUser;
    if(user){
      let newCard = $scope.removeExtraFields(card)
      let deckId = secondDeck ? $scope.secondDeck.$id : $scope.activeDeck.$id
      let deckName = $scope.activeDeck.name
      $scope.deckField = '';
      $scope.adding = false;
      let path = `users/${user.uid}/decks/${deckId}/cards`
      let ref = firebase.database().ref(path);
      let newRef = ref.push();
      newRef.set(newCard).then(function() {
        $scope.footerText = `${newCard.name} added to your '${deckName}' deck!`;
        $scope.$apply();
      });
    }
  }

  $scope.addDeck = function() {
    let user = firebase.auth().currentUser;
    if(user && $scope.deckField != ''){
      let ref = firebase.database().ref(`users/${user.uid}/decks`);
      let newRef = ref.push();
      let newItem = {
        name: $scope.deckField
      };
      newRef.set(newItem).then(function(){
        $scope.activeDeck = $scope.decks.$getRecord(newRef.getKey());
        $scope.clearDisplay();
      });
    }
  }

  $scope.joinGame = function() {
    let user = firebase.auth().currentUser;
    if(user) {
      let ref = firebase.database().ref(`game/${user.uid}`)
      ref.update({
        name: $scope.activeDeck.name,
        library: $scope.activeDeck.cards
      });
      let libraryRef = ref.child('library')
      $scope.library = $firebaseArray(libraryRef)
      let handRef = ref.child('hand')
      $scope.hand = $firebaseArray(handRef)
    }
  }

  $scope.clickDeckCard = function(card){
    let user = firebase.auth().currentUser;
    if(user) {
      if($scope.removeFromDeck) {
        let ref = firebase.database().ref(`users/${user.uid}/decks/${$scope.activeDeck.$id}/cards/${card.$id}`).remove().then(function(){
          $scope.footerText = `${card.name} removed from your ${$scope.activeDeck.name} deck!`;
          $scope.$apply();
        });
      }
      if ($scope.addToSecondDeck) {
        $scope.addCard(card, true)
      }
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

  $scope.removeDeck = function(){
    let user = firebase.auth().currentUser;
    if(user){
      $scope.footerText =  `'${$scope.activeDeck.name}' deck removed!`;
      firebase.database().ref(`users/${user.uid}/decks/${$scope.activeDeck.$id}`).remove().then(function() {
        if($scope.decks.length == 0){
          $scope.deckField = 'Default';
          $scope.addDeck();
        }
        let key = $scope.decks.$keyAt(0);
        $scope.activeDeck = $scope.decks.$getRecord(key);
        $scope.clearDisplay();
        });
    }
  }

  $scope.getCards = function() {
    if($scope.cardField == '') { return;}
      $scope.deckField = '';
      let user = firebase.auth().currentUser;
    if(user){
      $scope.adding = false;
      $scope.deckCards = [];
      $scope.footerText = `Click on a card to add it to your '${$scope.activeDeck.name}' deck!`
    }
    let myurl= `/getcard?q=${$scope.cardField}`;
    return $http.get(myurl).success(function(data){
      angular.copy(data.data, $scope.searchResults);
    });
  }

  $scope.logout = function() {
    if(!$scope.logged) {
      let provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    } else {
      $scope.logged = false;
      $scope.manage = false;
      $scope.logButton = 'Login';
      $scope.nameofthatbutton = 'Login';
      $scope.deckCards = [];
      $scope.searchResults = [];
      $scope.cardField = '';
      firebase.auth().signOut();
    }
  }

  $scope.getDeck = function() {
    let user = firebase.auth().currentUser;
    if(user){
      if($scope.manage){
        $scope.manage = false;
        $scope.nameofthatbutton = 'Manage Decks';
        $scope.footerText = ''
        $scope.$apply();
      } else {
        $scope.manage = true;
        $scope.nameofthatbutton = 'Add Cards'
        //$scope.footerText = `This is your '${$scope.activeDeck.name}' deck, click a card to remove it.`
        $scope.footerText = ''
        let userId = firebase.auth().currentUser.uid;
        let ref = firebase.database().ref(`/users/${userId}/decks/${$scope.activeDeck.$id}/cards`)
        $scope.deckCards = $firebaseArray(ref);
        $scope.deckField = '';
        $scope.adding = false;
        $scope.searchResults = [];
        $scope.$apply();
      }
    } else {
      let provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    }
  }
}]);
