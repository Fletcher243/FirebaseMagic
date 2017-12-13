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
  $scope.nameofthatbutton = "Login";
  $scope.logged = false;
  
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
      $scope.decks.$loaded()
      .then(function() {
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
        console.log($scope.activeDeck);
        console.log($scope.decks);
        $scope.nameofthatbutton = "Display Deck";
        $scope.logged = true;
        $scope.$apply() 	
      } else {
  $scope.nameofthatbutton = "Login";
		  $scope.$apply() 
        console.log("Please authenticate");
      }
    });    
  

  $scope.addCard = function(card){
	  	
    var user = firebase.auth().currentUser;
    if(user){
      var ref = firebase.database().ref('users/' + user.uid + "/decks/" + $scope.activeDeck.$id + "/cards");
      var newRef = ref.push();
      var newItem = {
        name: card.name,
        imageUrl: card.imageUrl
      };
      newRef.set(newItem);
    }	
		
console.log($scope.decks.$getRecord($scope.activeDeck.$id));

   return $http.post('/addcard', card).success(function(data){
	  $scope.displayText = card.name + " added to " + $scope.decks.$getRecord($scope.activeDeck.$id).name + " deck!";
    });
  }

  $scope.deckField = '';

  $scope.addDeck = function(){
	var user = firebase.auth().currentUser;
   	 if(user && $scope.deckField != ""){
    		var ref = firebase.database().ref('users/' + user.uid + "/decks");
		var newRef = ref.push();
		var newItem = {
		  name: $scope.deckField
		};
                console.log(newItem);
		newRef.set(newItem).then(function(){
    		$scope.activeDeck = newItem;
                $scope.activeDeck = $scope.decks.$getRecord(newRef.getKey());
                $scope.deckField = "";
                $scope.deckcards = [];
                $scope.$apply();
                });  
}
  }


  $scope.removeCard = function(card){
	  
	  
	  var user = firebase.auth().currentUser;
    if(user){
		console.log($scope.deckcards);
		console.log(card);
		var ref = firebase.database().ref('users/' + user.uid + "/decks/" + $scope.activeDeck.$id + "/cards/" + card.$id).remove();
		$scope.getDeck();
	}
  }

  $scope.removeDeck = function(){
	  
	  var user = firebase.auth().currentUser;
    if(user){
	  firebase.database().ref('users/' + user.uid + "/decks/" + $scope.activeDeck.$id).remove().then(function() {
            if($scope.decks.length == 0){
              $scope.deckField = "default"; 
              $scope.addDeck();
            }
            var key = $scope.decks.$keyAt(0);
            $scope.activeDeck = $scope.decks.$getRecord(key);
            $scope.deckcards = [];
            $scope.$apply();
          });
          console.log($scope.decks);
          console.log($scope.activeDeck.$id);

	}

  }

  $scope.getCards = function() {
    if($scope.cardField == "") { return;}
    $scope.displayText = "Click on a card to add it to the deck!"
    var myurl= "/getcard?q=";
    myurl += $scope.cardField;
    $scope.deckcards = [];
    return $http.get(myurl).success(function(data){

    angular.copy(data, $scope.mycards);
    });
}

$scope.logout = function() {
	$scope.logged = false;
	$scope.deckcards = [];
	firebase.auth().signOut();
}


  $scope.getDeck = function() {
    var user = firebase.auth().currentUser;
    if(user){
        console.log($scope.activeDeck);
	var userId = firebase.auth().currentUser.uid;
        var ref = firebase.database().ref('/users/' + userId + "/decks/" + $scope.activeDeck.$id + "/cards")
        $scope.deckcards = $firebaseArray(ref);
	console.log($scope.deckcards);
        $scope.displayText = "This is your current deck, click a card to remove it."
        $scope.mycards = [];
	$scope.$apply();
}
  else {
       var provider = new firebase.auth.GoogleAuthProvider();
       firebase.auth().signInWithRedirect(provider);
  }
}
}]);