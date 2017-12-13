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
  
    firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if (user) {
        firebase.database().ref('users/' + user.uid).update({
          username:user.displayName
        });

        var ref = firebase.database().ref('users/' + user.uid + "/decks/default");
        var newRef = ref.push();
        var newItem = {
          name: "default"
  	    };
        var ref = firebase.database().ref().child("users/" + user.uid + "/decks");
        $scope.decks = $firebaseArray(ref);
        $scope.decks.$loaded().then(function() {
          console.log($scope.decks);
          if($scope.decks.length == 0){
            $scope.deckField = "Default"; 
            $scope.addDeck();
          }
          var key = $scope.decks.$keyAt(0);
          $scope.activeDeck = $scope.decks.$getRecord(key);
          })
        .catch(function(error) {
          console.log("Error:", error);
        });
        $scope.nameofthatbutton = "Display Deck";
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
	  	
    var user = firebase.auth().currentUser;
    if(user){
	  $scope.deckField = "";
	  $scope.adding = false;
      var ref = firebase.database().ref('users/' + user.uid + "/decks/" + $scope.activeDeck.$id + "/cards");
      var newRef = ref.push();
      var newItem = {
        name: card.name,
        imageUrl: card.imageUrl
      };
      newRef.set(newItem).then(function(){  
	    $scope.displayText = card.name + " added to your '" + $scope.decks.$getRecord($scope.activeDeck.$id).name + "' deck!";
	    $scope.$apply();
	  });
    }	
  }

  $scope.addDeck = function(){
	var user = firebase.auth().currentUser;
   	if(user && $scope.deckField != ""){
      var ref = firebase.database().ref('users/' + user.uid + "/decks");
	  var newRef = ref.push();
	  var newItem = {
	    name: $scope.deckField
	  };
		newRef.set(newItem).then(function(){
    	  $scope.activeDeck = newItem;
          $scope.activeDeck = $scope.decks.$getRecord(newRef.getKey());
		  $scope.displayText =  "'" + $scope.deckField + "'" +  " deck added!";
          $scope.clearDisplay();
        });  
    }
  }

  $scope.removeCard = function(card){
	var user = firebase.auth().currentUser;
    if(user){
	  var ref = firebase.database().ref('users/' + user.uid + "/decks/" + $scope.activeDeck.$id + "/cards/" + card.$id).remove().then(function(){
	    $scope.displayText = card.name + " removed from your " + $scope.decks.$getRecord($scope.activeDeck.$id).name + " deck!";
		$scope.$apply();
	  });
	  $scope.getDeck();
	}
  }
  
  $scope.clearDisplay = function(){
	  $scope.deckField = "";
	  $scope.adding = false;
	  $scope.deckcards = [];
	  $scope.$apply();
  }

  $scope.removeDeck = function(){
	var user = firebase.auth().currentUser;
    if(user){
		
		$scope.displayText =  "'" + $scope.activeDeck.name + "'" +  " deck removed!";
	  firebase.database().ref('users/' + user.uid + "/decks/" + $scope.activeDeck.$id).remove().then(function() {
        if($scope.decks.length == 0){
          $scope.deckField = "default"; 
          $scope.addDeck();
        }
        var key = $scope.decks.$keyAt(0);
        $scope.activeDeck = $scope.decks.$getRecord(key);
        $scope.clearDisplay();
      });
	}
  }

  $scope.getCards = function() {
    if($scope.cardField == "") { return;}
	$scope.deckField = "";
	$scope.adding = false;
	$scope.deckcards = [];
		
    $scope.displayText = "Click on a card to add it to the deck!"
    var myurl= "/getcard?q=";
    myurl += $scope.cardField;
    
    return $http.get(myurl).success(function(data){
      angular.copy(data, $scope.mycards);
    });
  }

  $scope.logout = function() {
    $scope.logged = false;
    $scope.nameofthatbutton = "Login";
    $scope.deckcards = [];
	$scope.mycards = [];
	$scope.cardField = '';
    firebase.auth().signOut();
  }


  $scope.getDeck = function() {
    var user = firebase.auth().currentUser;
    if(user){
      console.log($scope.activeDeck);
	  var userId = firebase.auth().currentUser.uid;
      var ref = firebase.database().ref('/users/' + userId + "/decks/" + $scope.activeDeck.$id + "/cards")
      $scope.deckcards = $firebaseArray(ref);
      $scope.displayText = "This is your current deck, click a card to remove it."
      $scope.deckField = "";
	  $scope.adding = false;
	  $scope.mycards = [];
    } else {
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    }
  }
}]);