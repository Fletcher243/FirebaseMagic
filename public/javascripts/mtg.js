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
    $scope.nameofthatbutton = 'Login';
    $scope.logged = false;
    $scope.adding = false;
    $scope.manage = true;
    $scope.addToSecondDeck = false;
    $scope.removeFromDeck = false;

    $scope.battlefieldCards = [];

    firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if (user) {
        firebase.database().ref(`users/${user.uid}`).update({
          username:user.displayName
        });

        let newRef = firebase.database().ref(`users/${user.uid}/decks/default`).push();
        let newItem = {
          name: 'default'
        };
        let ref = firebase.database().ref().child(`users/${user.uid}/decks`);
        $scope.decks = $firebaseArray(ref);
        let ref2 = ref.child('Battlefield') 
        $scope.battlefieldDecks = $firebaseArray(ref2)
        $scope.battlefieldDecks.$loaded().then(function() {
          $scope.clearDisplay();
        }).catch(function(error) {
          console.log('Error:', error);
        });
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
        $scope.nameofthatbutton = 'Add Cards';
        $scope.logged = true;
        $scope.$apply()
      } else {
        $scope.nameofthatbutton = 'Login';
        $scope.$apply();
      }
    });

  $scope.nameDeck = function(){
    $scope.adding = true;
  }

  $scope.addCard = function(card, secondDeck = false){
    let user = firebase.auth().currentUser;
    if(user){
      let deckId = secondDeck ? $scope.secondDeck.$id : $scope.activeDeck.$id
      let deckName = $scope.activeDeck.name
      $scope.deckField = '';
      $scope.adding = false;
      console.log($scope.secondDeck.name)
      console.log($scope.secondDeck.name === 'Battlefield')
      console.log($scope.activeDeck.name)
      console.log(deckName)
      let path = `users/${user.uid}/decks/${deckId}${secondDeck && $scope.secondDeck.name === 'Battlefield' ? `/${deckName}` : ''}/cards`
      console.log(path)
      let ref = firebase.database().ref(path);
      let newRef = ref.push();
      let newItem = {
        name: card.name,
        imageUrl: card.imageUrl
      };
      newRef.set(newItem).then(function(){
      $scope.footerText = `${card.name} added to your '${deckName}' deck!`;
      $scope.$apply();
      });
    }
  }

  $scope.addDeck = function(){
    let user = firebase.auth().currentUser;
    if(user && $scope.deckField != ''){
      let ref = firebase.database().ref(`users/${user.uid}/decks`);
      let newRef = ref.push();
      let newItem = {
        name: $scope.deckField
      };
      newRef.set(newItem).then(function(){
        $scope.activeDeck = newItem;
        $scope.activeDeck = $scope.decks.$getRecord(newRef.getKey());
        $scope.clearDisplay();
      });
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
      angular.copy(data, $scope.searchResults);
    });
  }

  $scope.logout = function() {
    $scope.logged = false;
    $scope.manage = false;
    $scope.nameofthatbutton = 'Login';
    $scope.deckCards = [];
    $scope.searchResults = [];
    $scope.cardField = '';
    firebase.auth().signOut();
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
