angular.module('cardeck', ["firebase"])
.controller('MainCtrl', [
  '$scope','$http','$firebaseArray',
  function($scope,$http, $firebaseArray){

    $scope.mycards = [];
    $scope.deckcards = [];
    $scope.decks = [];
    $scope.activeDeck;
    $scope.cardField = '';
    $scope.displayText = '';
    $scope.deckField = '';
    $scope.nameofthatbutton = "Login";
    $scope.logged = false;
    $scope.adding = false;
    $scope.manage = true;
    $scope.addToSecondDeck = false;
    $scope.removeFromDeck = true;
    $scope.secondDeck;

    firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if (user) {
        firebase.database().ref('users/' + user.uid).update({
          username:user.displayName
        });

        let newRef = firebase.database().ref('users/' + user.uid + "/decks/default").push();
        let newItem = {
          name: "default"
  	};
        let ref = firebase.database().ref().child("users/" + user.uid + "/decks");
        $scope.decks = $firebaseArray(ref);
        $scope.decks.$loaded().then(function() {
          if($scope.decks.length < 1){
            $scope.deckField = "Default"; 
            $scope.addDeck();
          }
          let key = $scope.decks.$keyAt(0);
          $scope.activeDeck = $scope.decks.$getRecord(key);
	  $scope.secondDeck = $scope.activeDeck
	  $scope.clearDisplay()
        }).catch(function(error) {
          console.log("Error:", error);
        });
        $scope.nameofthatbutton = "Add Cards";
        $scope.logged = true;
        $scope.$apply() 	
      } else {
        $scope.nameofthatbutton = "Login";
        $scope.$apply();
      }
    });    

  $scope.nameDeck = function(){
    $scope.adding = true;
  }

  $scope.addCard = function(card){	  	
    let user = firebase.auth().currentUser;
    if(user){
      let deckname = $scope.decks.$getRecord($scope.activeDeck.$id).name
      $scope.deckField = "";
      $scope.adding = false;
      let ref = firebase.database().ref('users/' + user.uid + "/decks/" + $scope.activeDeck.$id + "/cards");
      let newRef = ref.push();
      let newItem = {
        name: card.name,
        imageUrl: card.imageUrl
      };
      newRef.set(newItem).then(function(){  
      $scope.displayText = card.name + " added to your '" + deckname + "' deck!";
      $scope.$apply();
      });
    }	
  }

  $scope.addDeck = function(){
    let user = firebase.auth().currentUser;
    if(user && $scope.deckField != ""){
      let ref = firebase.database().ref('users/' + user.uid + "/decks");
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
        let ref = firebase.database().ref('users/' + user.uid + "/decks/" + $scope.activeDeck.$id + "/cards/" + card.$id).remove().then(function(){
          $scope.displayText = card.name + " removed from your " + $scope.decks.$getRecord($scope.activeDeck.$id).name + " deck!";
          $scope.$apply();
        });
      }
      if ($scope.addToSecondDeck) {
	let temp = $scope.activeDeck
        $scope.activeDeck = $scope.secondDeck
	$scope.addCard(card)
	$scope.activeDeck = temp
      }
    }
  }
  
  $scope.clearDisplay = function(){
    $scope.deckField = "";
    $scope.adding = false;
    if($scope.manage){
      $scope.manage = false;
      $scope.getDeck();
    } else {
      $scope.deckcards = [];
    }
    $scope.$apply();
  }

  $scope.removeDeck = function(){
    let user = firebase.auth().currentUser;
    if(user){		
      $scope.displayText =  "'" + $scope.activeDeck.name + "'" +  " deck removed!";
      firebase.database().ref('users/' + user.uid + "/decks/" + $scope.activeDeck.$id).remove().then(function() {
        if($scope.decks.length == 0){
          $scope.deckField = "Default"; 
          $scope.addDeck();
        }
        let key = $scope.decks.$keyAt(0);
        $scope.activeDeck = $scope.decks.$getRecord(key);
        $scope.clearDisplay();
        });
    }
  }

  $scope.getCards = function() {
    if($scope.cardField == "") { return;}
      $scope.deckField = "";
      let user = firebase.auth().currentUser;
    if(user){
      $scope.adding = false;
      $scope.deckcards = [];
      $scope.displayText = "Click on a card to add it to your '" + $scope.activeDeck.name + "' deck!"
    }
    let myurl= "/getcard?q=";
    myurl += $scope.cardField;
    $scope.cardField = "";

    return $http.get(myurl).success(function(data){
      angular.copy(data, $scope.mycards);
    });
  }

  $scope.logout = function() {
    $scope.logged = false;
    $scope.manage = false;
    $scope.nameofthatbutton = "Login";
    $scope.deckcards = [];
    $scope.mycards = [];
    $scope.cardField = '';
    firebase.auth().signOut();
  }

  $scope.getDeck = function() {
    let user = firebase.auth().currentUser;
    if(user){
      if($scope.manage){
        $scope.manage = false;
        $scope.nameofthatbutton = "Manage Decks";
        $scope.displayText = ""
        $scope.$apply();
      } else {
        $scope.manage = true;
        let userId = firebase.auth().currentUser.uid;
        let ref = firebase.database().ref('/users/' + userId + "/decks/" + $scope.activeDeck.$id + "/cards")
        $scope.deckcards = $firebaseArray(ref);
        $scope.displayText = "This is your '" + $scope.activeDeck.name + "' deck, click a card to remove it."
        $scope.deckField = "";
        $scope.adding = false;
        $scope.mycards = [];
        $scope.nameofthatbutton = "Add Cards"
        $scope.$apply();
      } 
    } else {
      let provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    }
  }
}]);
