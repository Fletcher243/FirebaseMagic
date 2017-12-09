angular.module('cardeck', [])
.controller('MainCtrl', [
  '$scope','$http',
  function($scope,$http){

  $scope.mycards = [];
  $scope.deckcards = [];
  $scope.cardField = '';
  $scope.displayText = '';
  $scope.nameofthatbutton = "Login";
  $scope.logged = false;
  
   firebase.auth().onAuthStateChanged(function(user) {
      $scope.user = user
      if (user) {
		  $scope.nameofthatbutton = "Display Deck";
		  $scope.logged = true;
		  $scope.$apply() 
		  
		  
        firebase.database().ref('users/' + user.uid).update({
          username:"Quinn"
        });
		
      } else {
$scope.nameofthatbutton = "Login";
		  $scope.$apply() 
        console.log("Please authenticate");
      }
    });    
  


  $scope.addCard = function(card){
	  	
		
	var user = firebase.auth().currentUser;
    if(user){

		var ref = firebase.database().ref('users/' + user.uid + "/deck");
		var newRef = ref.push();
		var newItem = {
			name: card.name,
			imageUrl: card.imageUrl,
			uid: newRef.getKey()
		};
		newRef.set(newItem);
	}
		
		
		
   return $http.post('/addcard', card).success(function(data){
	  $scope.displayText = card.name +" added to deck!";
    });
  }

  $scope.removeCard = function(card){
	  
	  
	  var user = firebase.auth().currentUser;
    if(user){
		console.log($scope.deckcards);
		console.log(card);
		var ref = firebase.database().ref('users/' + user.uid + "/deck/" + card.uid).remove();
		$scope.getDeck();

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
	var userId = firebase.auth().currentUser.uid;
        firebase.database().ref('/users/' + userId + "/deck").once('value').then(function(snapshot) {
		$scope.deckcards = snapshot.val();
		console.log($scope.deckcards);
		$scope.$apply();
        });
    $scope.displayText = "This is your current deck, click a card to remove it."
      $scope.mycards = [];
}
  else {
       var provider = new firebase.auth.GoogleAuthProvider();
       firebase.auth().signInWithRedirect(provider);
  }
}
}]);