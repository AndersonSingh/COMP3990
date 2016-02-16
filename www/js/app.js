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

  .state('sign-in', {
    url: '/sign-in',
    templateUrl: 'templates/sign-in.html',
    controller: 'SignInCtrl'
  })

  .state('sign-up', {
    url: '/sign-up',
    templateUrl: 'templates/sign-up.html',
    controller: 'SignUpCtrl'
  });

  $urlRouterProvider.otherwise('/sign-in');
}])

.controller('SignUpCtrl', ['$scope', function($scope){

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
          }
        });
      }

    });

  };

}])

.controller('SignInCtrl', ['$scope', function($scope){

  /* this is a reference to the firebase url. */
  var ref = new Firebase('https://comp3990.firebaseio.com');

  /* declaration of variables */
  $scope.email = null;
  $scope.password = null;

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
      }
    });
  };

}]);
