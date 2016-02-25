// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    // The reason we default this to hidden is that native apps don't usually show an accessory bar, at
    // least on iOS. It's a dead giveaway that an app is using a Web View. However, it's sometimes
    // useful especially with forms, though we would prefer giving the user a little more room
    // to interact with the app.
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }
  });
})

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu-template.html',
    controller: 'MenuCtrl'
   })

  .state('sign-in', {
    url: '/sign-in',
    templateUrl: 'templates/sign-in.html',
    controller: 'SignInCtrl'
  })

  .state('sign-up', {
    url: '/sign-up',
    templateUrl: 'templates/sign-up.html',
    controller: 'SignUpCtrl'
  })

  .state('app.seller-add-item', {
    url: '/seller-add-item',
    views: {
        'menuContent': {
        templateUrl: 'templates/seller-add-item.html',
        controller:'SellerCtrl'
        }
    }
  })
  
   .state('app.view-my-items', {
    url: '/view-my-items',
    views: {
        'menuContent': {
        templateUrl: 'templates/view-my-items.html',
        controller:'ViewItemCtrl'
        }
    }
  })

  .state('app.home', {
    url: '/home',
    views: {
        'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
        }
    }
  });

  $urlRouterProvider.otherwise('sign-in');
}])

.controller('SignUpCtrl', ['$scope','$state', function($scope,$state){

  /* this is a reference to the firebase url. */
  var ref = new Firebase('https://comp3990.firebaseio.com');

  /* declaration of variables */
  $scope.name = null;
  $scope.email = null;
  $scope.password = null;

  /* this function will attempt to sign a user up for an account. */
  $scope.signUp = function(name, email, password){

    /* use firebase function createUser to attempt to create user account.*/
    ref.createUser({
      email: email,
      password: password
    },
    function(error, userData){

      if(error){
        console.log('INFO: ERROR CREATING USER ACCOUNT. DEBUG: ', error);
      }
      else{
        console.log('INFO: SUCCESSFULLY CREATED USER ACCOUNT. DEBUG: ', userData);

        /* The user is now successfully registered. The user details is now pushed to firebase. */
        var usersRef = ref.child('/users/' + userData.uid);

        usersRef.set({'email' : email, 'name' : name}, function(error){

          if(error){
            console.log('INFO: ERROR SYNCING DATA TO FIREBASE. DEBUG: ', error);
          }
          else{
            console.log('INFO: SUCCESSFULLY SYNCED DATA TO FIREBASE.');
           $state.go('app.home');
          }
        });
      }

    });

  };

}])

.controller('SignInCtrl', ['$scope',  '$state', function($scope, $state){

  /* this is a reference to the firebase url. */
  var ref = new Firebase('https://comp3990.firebaseio.com');

  /* declaration of variables */
  $scope.email = null;
  $scope.password = null;

  /* this function checks if the user is already signed in.  */
  $scope.checkUserSession = function(){

    var authData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));

    if(authData !== null) {

      var expiryDate = new Date(authData.expires * 1000);

      if(expiryDate > new Date()){
        /* IMPORTANT: session is still valid, redirect to valid state.*/
        console.log("INFO: USER SESSION IS VALID.");
      }

    }
  };

  /* this function will attempt to sign in a user. */
  $scope.signIn = function(email, password){

    /* use authWithPassword from firebase to authenticate a user. */
    ref.authWithPassword({
      email : email,
      password: password
    },
    function(error, userData){
      if(error){
        console.log('INFO: ERROR LOGGING USER IN. DEBUG: ', error);
      }
      else{
        console.log('INFO: SUCCESSFULLY LOGGED IN USER. DEBUG: ', userData);
        /* IMPORTANT : redirect to valid state. */
        $state.go('app.home');
      }
    });
  };

}])

.controller('MenuCtrl',['$scope', '$state',function($scope, $state){
    $scope.changeStateHome=function(){
        $state.go('app.home');
    };

    $scope.changeStateSell=function(){
        $state.go('app.seller-add-item');
    }
    
     $scope.changeStateViewMyItems=function(){
        $state.go('app.view-my-items');
    }

}])

.controller('SellerCtrl',['$scope',function($scope){
  // create a reference to firebase database products section
  var firebaseRef = new Firebase("https://comp3990.firebaseio.com/products")

  // stores attributes of an item entered via view
  $scope.item = {};

  // defult in case no picture is added
  $scope.item.picture = "default.jpg";

  // get user uid via a service

  // this function will store a new item for the logged in user in the database
  $scope.addNewItem = function(){
      // currently hardcoded uid of seller
      var uid = "77fc025d-e9b1-47f1-bb96-d5364f81fb1c";

      // move down directly to the products area for this particular user
      var userProductsRef = firebaseRef.child(uid);
      console.log($scope.item);

      // push new item to firebase
      userProductsRef.push($scope.item);
  };

  // this function will allow the user to take a photo with the device's camera
  $scope.snapPicture = function(){

      // specifiying camera options
      var options = {
        // specify to use rear facing camera on device
        cameraDirection : 0,

      };

      navigator.camera.getPicture(options).then(function(imageURI) {
        // imageURI is the URL of the image
        console.log("Photo taken successfully");
        $scope.item.picture = imageURI;

    }, function(error) {
        // error occured
        console.log("Error occured when trying to take photo");
    });
  };

}])

.controller('HomeCtrl',['$scope', '$firebaseObject', function($scope, $firebaseObject){
    var ref = new Firebase("https://comp3990.firebaseio.com");

    $scope.products = $firebaseObject(ref.child('/products'));
    $scope.products.$loaded(function(data){
       $scope.items=[];
       for(var user in data){
           console.log(user);
           if(user.charAt(0) != '$' && user != 'forEach'){
               for(var item in $scope.products[user]){
                   //console.log($scope.products[user][item].name);
                   $scope.items.push($scope.products[user][item]);
               }
           }
       }
    });

}])

.controller('ViewItemCtrl', ['$scope', '$firebaseObject', function($scope, $firebaseObject){
    
       var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
       console.log(localData['uid']);
       //UID LOCATED AND STORED
       
       var ref = new Firebase("https://comp3990.firebaseio.com");
       //FOR TEST PURPOSES!
       var userId="5e224fc5-b956-43c3-84b5-f6eecfc9cffb ";
    
       $scope.products = $firebaseObject(ref.child('/products'));
       $scope.products.$loaded(function(data){
       $scope.items=[];
       for(var user in data){
           if(user.charAt(0) != '$' && user != 'forEach'){
                if(userId.localeCompare(String(user))==0){
                    for(var item in $scope.products[user]){
                        $scope.items.push($scope.products[user][item]);
                    }
                }
           }
       }
    });
}]);
