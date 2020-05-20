angular.module('cardeck', ['firebase'])
.controller('ManageDecksCtrl', [
  '$scope','$http','$firebaseArray',
  function($scope,$http, $firebaseArray) {

    $scope.searchResults = [];
    $scope.deckCards = [];
    $scope.decks = [];

    $scope.activeDeck;
    $scope.cardField = '';
    $scope.footerText = '';
    $scope.deckField = '';

    $scope.logButton = 'Login'
    $scope.showCreateField = false;
    $scope.deckView = true;
    $scope.removeFromDeck = false;
    $scope.extras = false;

    $scope.deckView = true;
    $scope.cardView = false;
    $scope.collectionView = false;

    $scope.maxlength = 30;
    $scope.removeInitiated = false;
    $scope.removeButtonText = 'Delete Deck';

    $scope.addToSecondCollection = false;
    $scope.addToCollection = true;
    $scope.addToDeck = true;

    $scope.collections = [];
    $scope.activeCollection;
    $scope.collectionCards = [];
    $scope.collectionField = '';

    $scope.colors = [
      {name: 'Blue', identity: 'U'},
      {name: 'Black', identity: 'B'},
      {name: 'Red', identity: 'R'},
      {name: 'Green', identity: 'G'},
      {name: 'White', identity: 'W'},
    ]

    $scope.activeColors = ['U','B','R','G','W']

    $scope.cardTypes = [
      'Land',
      'Creature',
      'Instant',
      'Sorcery',
      'Enchantment',
      'Artifact',
      'Planeswalker'
    ]

    $scope.filterField = '';
    $scope.cmc;

    $scope.includeColorless = true;

    firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if ($scope.user) {
        firebase.database().ref(`users/${$scope.user.uid}`).update({
          username: $scope.user.displayName
        });

        let decksRef = firebase.database().ref(`users/${$scope.user.uid}/decks`);
        let collectionsRef = firebase.database().ref(`users/${$scope.user.uid}/collections`);
        $scope.collections = $firebaseArray(collectionsRef);
        $scope.collections.$loaded().then(function() {
          if($scope.collections.length < 1) {
            $scope.collectionField = 'My Collection'
            $scope.addCollection();
          }
          let key = $scope.collections.$keyAt(0);
          $scope.activeCollection = $scope.collections.$getRecord(key);
          $scope.activateCollection();
          $scope.secondCollection = $scope.activeCollection;
        }).catch(function(error) {
          console.log('Error:', error);
        });
        $scope.decks = $firebaseArray(decksRef);
        $scope.decks.$loaded().then(function() {
          if($scope.decks.length < 1){
            $scope.deckField = 'Default';
            $scope.addDeck();
          }
          let key = $scope.decks.$keyAt(0);
          $scope.activeDeck = $scope.decks.$getRecord(key);
          $scope.activateDeck();
          $scope.clearDisplay()
        }).catch(function(error) {
          console.log('Error:', error);
        });
      } else {
        location.href = '../'
      }
    });

    $scope.nameField = function() {
      $scope.showCreateField = true;
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

    $scope.removeExtraFields = function(card) {
      if(card.hasOwnProperty('$$hashKey')) delete card.$$hashKey
      if(card.hasOwnProperty('$priority')) delete card.$priority
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

    $scope.addCard = function(card) {
      let newCard = $scope.removeExtraFields(card)
      let id = card.id
      if(card.hasOwnProperty('$id')) delete card.$id
      if($scope.addToDeck) {
        let endpoint = $scope.extras ? 'extras' : 'cards'
        let path = `users/${$scope.user.uid}/decks/${$scope.activeDeck.$id}/${endpoint}`
        let ref = firebase.database().ref(path).push();
        ref.set(newCard)
      }
      if($scope.addToCollection) {
        let endpoint = $scope.extras ? 'extras' : 'cards'
        let collectionId = $scope.addToSecondCollection ? $scope.secondCollection.$id : $scope.activeCollection.$id
        let path = `users/${$scope.user.uid}/collections/${collectionId}/${endpoint}`
        let ref = firebase.database().ref(path).push();
        ref.set(newCard)
      }
      card.$id = id;
    }

    $scope.addCollection = function() {
      if($scope.collectionField != '') {
        let ref = firebase.database().ref(`users/${$scope.user.uid}/collections`).push();
        let newItem = {
          name: $scope.collectionField
        }
        $scope.collectionField = '';
        $scope.showCreateField = false;
        ref.set(newItem).then(function() {
          $scope.activeCollection = $scope.collections.$getRecord(ref.getKey());
        })
      }
    }

    $scope.addDeck = function() {
      if($scope.deckField != '') {
        let ref = firebase.database().ref(`users/${$scope.user.uid}/decks`);
        let newRef = ref.push();

        let newItem = {
          name: $scope.deckField
        };
        $scope.deckField = '';
        $scope.showCreateField = false;
        newRef.set(newItem).then(function() {
          $scope.activeDeck = $scope.decks.$getRecord(newRef.getKey());
        });
      }
    }

    $scope.activateDeck = function() {
      const path = `/users/${$scope.user.uid}/decks/${$scope.activeDeck.$id}/cards`
      const path2 = `/users/${$scope.user.uid}/decks/${$scope.activeDeck.$id}/extras`
      let ref = firebase.database().ref(path)
      let ref2 = firebase.database().ref(path2)
      $scope.deckCards = $firebaseArray(ref);
      $scope.deckExtras = $firebaseArray(ref2);
    }

    $scope.activateCollection = function() {
      const path = `/users/${$scope.user.uid}/collections/${$scope.activeCollection.$id}/cards`
      let ref = firebase.database().ref(path)
      $scope.collectionCards = $firebaseArray(ref)

    }

    $scope.joinGame = function() {
      let ref = firebase.database().ref(`game/${$scope.user.uid}`)
      ref.update({
        name: $scope.user.displayName,
        library: $scope.activeDeck.cards,
        hand: {},
        graveyard: {},
        lands: {},
        exile: {},
        battlefield: {},
        extras: $scope.activeDeck.extras,
        life: 40
      }).then(function(){
        location.href='../battlefield'
      });
    }

    $scope.clickDeckCard = function(card) {
      if($scope.removeFromDeck) {
        let endpoint = $scope.extras ? 'extras' : 'cards'
        let path = `users/${$scope.user.uid}/decks/${$scope.activeDeck.$id}/${endpoint}/${card.$id}`
        let ref = firebase.database().ref(path).remove().then(function(){
          $scope.footerText = `${card.name} removed from your ${$scope.activeDeck.name} deck!`;
          $scope.$apply();
        });
      }
    }

    $scope.clickCollectionCard = function(card) {
      let endpoint = $scope.extras ? 'extras' : 'cards';
      let id = card.$id;
      if(card.hasOwnProperty('$id')) delete card.$id
      if(card.hasOwnProperty('$priority')) delete card.$priority
      if(card.hasOwnProperty('$$hashKey')) delete card.$$hashKey
      if($scope.removeFromCollection) {
        let path = `users/${$scope.user.uid}/collections/${$scope.activeCollection.$id}/${endpoint}/${id}`
        let ref = firebase.database().ref(path).remove().then(function() {
          $scope.footerText = `${card.name} removed from your ${$scope.activeCollection.name} collection!`;
          $scope.$apply();
        });
      }
      if($scope.addToSecondCollection) {
        let path = `users/${$scope.user.uid}/collections/${$scope.secondCollection.$id}/${endpoint}`
        let ref = firebase.database().ref(path).push();
        ref.set(card)
      }
      if($scope.addToDeck) {
        let path = `users/${$scope.user.uid}/decks/${$scope.activeDeck.$id}/${endpoint}`
        let ref = firebase.database().ref(path).push();
        ref.set(card) 
      }
      card.$id = id;
    }

    $scope.selectDeck = function(deck) {
      $scope.activeDeck = deck;
      $scope.activateDeck();
    }

    $scope.selectCollection = function(collection) {
      $scope.activeCollection = collection;
      $scope.activateCollection();
    }

    $scope.clearDisplay = function() {
      $scope.deckField = '';
      $scope.showCreateField = false;
      $scope.removeInitiated = false;
      $scope.removeButtonText = 'Delete Deck'
    }

    $scope.initiateRemove = function() {
      if($scope.removeInitiated) {
        $scope.removeInitiated = false;
        $scope.removeButtonText = `Delete ${$scope.deckView ? 'Deck' : 'Collection'}`;
      } else {
        $scope.removeInitiated = true;
        $scope.removeButtonText = `Cancel! I don't want to delete ${$scope.deckView ? $scope.activeDeck.name : $scope.activeCollection.name}!`
        $scope.removeInitiatedText = `Remove ${$scope.deckView ? $scope.activeDeck.name : $scope.activeCollection.name} forever!`
      }
    }

    $scope.removeDeck = function() {
      $scope.footerText = `'${$scope.activeDeck.name}' deck removed!`;
      firebase.database().ref(`users/${$scope.user.uid}/decks/${$scope.activeDeck.$id}`).remove().then(function() {
        if($scope.decks.length == 0) {
          $scope.deckField = 'Default';
          $scope.addDeck();
        }
        let key = $scope.decks.$keyAt(0);
        $scope.activeDeck = $scope.decks.$getRecord(key);
        $scope.clearDisplay();
      });
    }

    $scope.getCards = function() {
      if($scope.cardField == '') return
      $scope.deckField = '';
      $scope.showCreateField = false;
      $scope.footerText = `Click on a card to add it to your '${$scope.activeDeck.name}' deck!`
      let myurl= `/getcard?q=${$scope.cardField}`;
      return $http.get(myurl).success(function(data) {
        angular.copy(data.data, $scope.searchResults);
      });
    }

    $scope.colorChecked = function(color) {
      if($scope.activeColors.includes(color.identity)) {
        $scope.activeColors = $scope.activeColors.filter(e => e !== color.identity)
      } else {
        $scope.activeColors.push(color.identity)
      }
      console.log($scope.activeColors)
    }

    $scope.filterFunction = function(card) {
      console.log(card)
      let showCard = card.name.includes($scope.filterField)
      if(showCard) {
        card.color_identity.forEach(function(color) {
          if(!$scope.activeColors.includes(color)){
            showCard = false;
            return;
          }
        });
      }
      if(showCard && !$scope.includeColorless) {
        showCard = card.color_identity.length != 0
      }
      if(showCard && $scope.filterCMC) {
        if($scope.greaterThanCMC) {
          showCard = card.cmc > $scope.targetCMC
        } else if($scope.lessThanCMC) {
          showCard = card.cmc < $scope.targetCMC
        } else if($scope.equalCMC) {
          showCard = card.cmc == $scope.targetCMC
        }
      }
      console.log(showCard)
      return showCard
    }

    $scope.toCardView = function() {
      $scope.cardView = true;
      $scope.deckView = false;
      $scope.collectionView = false;
      $scope.addToSecondCollection = false;
    }

    $scope.toDeckView = function() {
      $scope.cardView = false;
      $scope.deckView = true;
      $scope.collectionView = false;
      $scope.removeButtonText = 'Remove Deck';
      $scope.showCreateField = false;
      $scope.addToSecondCollection = false;
    }

    $scope.toCollectionView = function() {
      $scope.cardView = false;
      $scope.deckView = false;
      $scope.collectionView = true;
      $scope.removeButtonText = 'Remove Collection';
      $scope.showCreateField = false;
    }
  }
]);
