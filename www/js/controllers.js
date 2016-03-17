angular.module('starter.controllers',['ionic','ngCordova'])

.controller('SignUpCtrl', ['$scope','$state', function($scope, $state){

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
        $state.go('tabs.tab-activity');
      }
    });
  };

}])

.controller('MenuCtrl',['$scope', '$state',function($scope, $state){


}])

.controller("SellingCtrl", ['$scope', '$firebaseObject', function($scope, $firebaseObject){

  // create a reference to firebase database
  var ref = new Firebase("https://comp3990.firebaseio.com");

  // get user uid that is currently logged in
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  var uid = localData['uid'];

  // download interested items for this user into local object
  $scope.allInterested = $firebaseObject(ref.child('/interests').child(uid));

  // download all prouducts for this user into local object to be used as a means of crossreference
  $scope.allUserProducts = $firebaseObject(ref.child('/products').child(uid));
}])

.controller('SellerCtrl',['$scope', '$state', '$cordovaCamera', function($scope, $state, $cordovaCamera){
  // create a reference to firebase database products section
  var firebaseRef = new Firebase("https://comp3990.firebaseio.com/products");

  // stores attributes of an item entered via view
  $scope.item = {};

  // defult in case no picture is added
  $scope.item.picture = "N/A";

  // initializing all payment methods to false
  $scope.item.payments = {};
  $scope.item.payments.bitcoin = false;
  $scope.item.payments.cash = false;
  $scope.item.payments.paypal = false;

  // this number will reflect at any given time how many users are interested in buying this product
  $scope.item.interested = 0;

  // get user uid that is currently logged in
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  var uid = localData['uid'];

  // this function will store a new item for the logged in user in the database
  $scope.addNewItem = function(){

      // convert string to double for price
      $scope.item.price = parseFloat($scope.item.price);

      // move down directly to the products area for this particular user
      var userProductsRef = firebaseRef.child(uid);
      console.log($scope.item);

      // push new item to firebase
      userProductsRef.push($scope.item);

      $state.go('menu-selling');
  };

  // this function will allow the user to take a photo with the device's camera
  $scope.snapPicture = function(){

    console.log("snap function running");

    ionic.Platform.ready(function(){
      // will execute when device is ready, or immediately if the device is already ready.
      console.log("device ready");
      // specifiying camera options
      var options = {
        cameraDirection : 0,                                              // specify use rear camera
        sourceType : 1,                                                   // specify take picture from camera
        encodingType : 0,                                                 // specify the image is encoded as a jpeg
        destinationType : 0,                                              // specify format of value returned is Base64 encoded string
        cameraDirection : 0,
        quality : 75,
        targetWidth : 250,
        targetHeight : 250,
        saveToPhotoAlbum : false
      };

      $cordovaCamera.getPicture(options).then(function(imageData) {
        // imageData is the Base64 encoded string of the image
        console.log("Photo taken successfully");
        $scope.item.picture = imageData;

    }, function(error) {
        // error occured
        console.log("Error: " + error);
    });

    });

  };

}])

.controller('HomeCtrl',['$scope', '$firebaseArray', function($scope, $firebaseArray){
    var ref = new Firebase("https://comp3990.firebaseio.com");
    $scope.allProducts = $firebaseArray(ref.child('/products'));

}])

.controller('ShopCtrl',['$scope', '$firebaseArray', function($scope, $firebaseArray){


}])

.controller('ViewItemCtrl', ['$scope', '$firebaseObject', 'UserProductsService', function($scope, $firebaseObject, UserProductsService){
    // //FIX CODE

    //    var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
    //    console.log(localData['uid']);
    //    //UID LOCATED AND STORED

    //    var ref = new Firebase("https://comp3990.firebaseio.com");
    //    //FOR TEST PURPOSES!

    // //    var userId = localData['uid'];

    // var userId = '5e224fc5-b956-43c3-84b5-f6eecfc9cffb';


    //    $scope.products = $firebaseObject(ref.child('/products'));
    //    $scope.products.$loaded(function(data){
    //    $scope.items=[];
    //    for(var user in data){
    //        if(user.charAt(0) != '$' && user != 'forEach'){
    //              if(userId.localeCompare(String(user))==0){
    //                 for(var item in $scope.products[user]){
    //                     $scope.items.push($scope.products[user][item]);
    //                     console.log("HELLO");
    //                 }
    //              }
    //        }
    //    }
    // });

    //DO NOT TOUCH

    var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
    // $scope.userId = localData['uid'];
    $scope.userId = '874d9189-4147-4795-a5f5-d28d9e9e5924';
    $scope.allProducts = {};
    $scope.loadProducts = function(){
        UserProductsService.$bindTo($scope,"allProducts");
    }


}])


.controller('ItemDetailCtrl', ['$scope', '$stateParams' ,'$firebaseObject', function($scope, $stateParams, $firebaseObject){
    var userId= $stateParams.userId;
    var productId= $stateParams.productId;

    var ref = new Firebase("https://comp3990.firebaseio.com");
    $scope.product = $firebaseObject(ref.child('/products/'+userId+'/'+productId+''));
    $scope.product.$loaded(function(data){
       $scope.itemDetails = data;
       $scope.paymentList = [];
       if(Boolean($scope.itemDetails.payments.paypal)===true){
           $scope.paymentList.push( { text: "Paypal", checked:false });
           console.log(Boolean($scope.itemDetails.payments.paypal));
       }
       if(Boolean($scope.itemDetails.payments.cash)===true){
           $scope.paymentList.push( { text: "Cash", checked:false });
       }
       if(Boolean($scope.itemDetails.payments.bitcoin)===true){
           $scope.paymentList.push( { text: "Bitcoin", checked:false });
       }
    });
}])

.controller('CategoryListCtrl',['$scope','$firebaseObject', '$stateParams','AllProductsService', function($scope, $firebaseObject, $stateParams, AllProductsService){
     $scope.category=$stateParams.category;
     $scope.allProducts = {};
     $scope.loadProducts = function(){
         AllProductsService.$bindTo($scope,"allProducts");
     }
}])

.controller('SideMenuCtrl', ['$scope', '$ionicSideMenuDelegate', function($scope, $ionicSideMenuDelegate){
  $scope.showMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };

}])


.controller('NewItemInterestedCtrl', ['$scope', '$stateParams', function($scope, $stateParams){

  $scope.transaction = {};
  $scope.message = {};

  /* firebase reference*/
  var ref = new Firebase("https://comp3990.firebaseio.com");


  /* get the userid of the person selling the product, as well as the product id. */

  $scope.sellerId = $stateParams.sellerId;
  $scope.productId = $stateParams.productId;

  /* access localStorage to get the loggedin user's userid. */
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  $scope.buyerId = localData['uid'];

  /* place the uid in the message object to know who sent the message. */
  $scope.message.sender = $scope.buyerId;

  /* this function runs when user clicks on the interested button */
  $scope.interestedButton = function(){

    /* create a product interest on firebase. */
    var transactionRef = ref.child('/interests/' + $scope.sellerId + '/' + $scope.productId + '/' + $scope.buyerId);

    /* push data to firebase. */
    transactionRef.child('/messages').push($scope.message);
  };

}])

.controller('BuyerInterestedItemsCtrl', ['$scope', '$firebaseObject', function($scope, $firebaseObject){

  /* firebase reference*/
  var ref = new Firebase("https://comp3990.firebaseio.com");

  /* pull out buyer id from localStorage. */
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  $scope.buyerId = localData['uid'];

  /*  we need to pull a list of all interests and use ng repeats to pick out correct items. */
  $scope.interests = $firebaseObject(ref.child('/interests'));

  /* we also need products list. */
  $scope.products = $firebaseObject(ref.child('/products'));

  /* we also need a users list. */
  $scope.appUsers = $firebaseObject(ref.child('/users'));
}])

.controller('BuyerInterestedItemOverviewCtrl', ['$scope', '$stateParams', function($scope, $stateParams){

  /* get the information passed over from the previous page. */
  $scope.sellerId = $stateParams.sellerId;
  $scope.buyerId = $stateParams.buyerId;
  $scope.productId = $stateParams.productId;
  $scope.perspective = $stateParams.perspective;

}])

.controller('MessengerCtrl', ['$scope', '$stateParams', '$firebaseObject', function($scope, $stateParams, $firebaseObject){
  /* firebase reference*/
  var ref = new Firebase("https://comp3990.firebaseio.com");

  /* get the data sent over by stateParams. */
  $scope.sellerId = $stateParams.sellerId;
  $scope.buyerId = $stateParams.buyerId;
  $scope.productId = $stateParams.productId;
  $scope.perspective = $stateParams.perspective;
  $scope.me = null;
  $scope.chatText = null;

  /* pull the interests list. */
  $scope.messages = $firebaseObject(ref.child('/interests/' + $scope.sellerId + '/' + $scope.productId + '/' + $scope.buyerId + '/messages'));

  /* this function decides which css class to apply to each message. */
  $scope.messageClass = function(sender){
    if($scope.perspective === 'buyer' && sender === $scope.buyerId){
      $scope.me = $scope.buyerId;
      return true;
    }
    else if($scope.perspective === 'seller' && sender === $scope.sellerId){
      $scope.me = $scope.sellerId;
      return true;
    }
    else{
      return false;
    }
  };

  $scope.sendMessage = function(message){
    ref.child('/interests/' + $scope.sellerId + '/' + $scope.productId + '/' + $scope.buyerId + '/messages').push({
      sender : $scope.me,
      text : message
    });

    /* clear chatText */
    $scope.chatText = "";
  }

}])

.controller('EmailCtrl', ['$scope', '$state', '$firebaseObject', function($scope, $state, $firebaseObject){

  // create a reference to firebase database users section
  var firebaseRef = new Firebase("https://comp3990.firebaseio.com/users");

  // get user uid that is currently logged in
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  var uid = localData['uid'];

  $scope.paypal = $firebaseObject(firebaseRef.child(uid));

  $scope.saveEmail = function(email){
    console.log("saving email");

    var obj = {paypal : email};

    //move down directly to the particular user
    var userRef = firebaseRef.child(uid);

    //update firebase with new attribute for this user
    userRef.update(obj);

    $state.go('menu-settings');
  };
}])

.controller('InterestedSellerCtrl', ['$scope', '$stateParams', '$firebaseObject', function($scope, $stateParams, $firebaseObject){

  // retrieve the productId the user clicked on to get to this page
  var productId = $stateParams.prodId;

  // create a reference to firebase database
  var firebaseRef = new Firebase("https://comp3990.firebaseio.com/");

  // get user uid that is currently logged in
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  var uid = localData['uid'];

  // download all the users who are interested in this seller's particular product
  $scope.allInterestedUsers = $firebaseObject(firebaseRef.child('interests').child(uid).child(productId));

  // download all the users to use as a crossreference
  $scope.users = $firebaseObject(firebaseRef.child('users'));

}])

.controller('InterestedOverviewCtrl', ['$scope', '$stateParams', function($scope, $stateParams){
  $scope.interestedUser = $stateParams.userId;

}])
