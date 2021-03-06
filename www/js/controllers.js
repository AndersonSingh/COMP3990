angular.module('starter.controllers',['ionic','ngCordova'])

.controller('SignUpCtrl', ['$scope','$state', function($scope, $state){

  /* this is a reference to the firebase url. */
  var ref = new Firebase('https://comp3990.firebaseio.com');

  /* declaration of variables */
  $scope.name = null;
  $scope.email = null;
  $scope.password = null;
  $scope.formSuccess = true;
  $scope.errorMessage = "";
  /* this function will attempt to sign a user up for an account. */
  $scope.signUp = function(form, name, email, password){

    if(form.$valid){
      /* use firebase function createUser to attempt to create user account.*/
      ref.createUser({
        email: email,
        password: password
      },
      function(error, userData){

        if(error){
          console.log('INFO: ERROR CREATING USER ACCOUNT. DEBUG: ', error);
          $scope.formSuccess = false;
          $scope.errorMessage = error.toString();
          $scope.$apply();
        }
        else{
          console.log('INFO: SUCCESSFULLY CREATED USER ACCOUNT. DEBUG: ', userData);

          /* The user is now successfully registered. The user details is now pushed to firebase. */
          var usersRef = ref.child('/users/' + userData.uid);

          if(userPushNotificationId === null){
            userPushNotificationId = false;

          }

          usersRef.set({'email' : email, 'name' : name, 'pushId' : userPushNotificationId, 'overallRating' : 0, 'photoChanged' : false, 'pendingReviews':0}, function(error){

            if(error){
              console.log('INFO: ERROR SYNCING DATA TO FIREBASE. DEBUG: ', error);
            }
            else{
              console.log('INFO: SUCCESSFULLY SYNCED DATA TO FIREBASE.');
             $state.go('sign-in');
            }
          });
        }

      });
    }

  };

}])

.controller('SignInCtrl', ['$scope',  '$state', 'SideMenuStateService','$firebaseObject', function($scope, $state, SideMenuStateService, $firebaseObject){

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
        SideMenuStateService.setSignedIn(true);
        $state.go('tabs.tab-activity');
      }

    }
  };

  /* this function will attempt to sign in a user. */
  $scope.signIn = function(form, email, password){

    /* only attempt to signin if the form is complete. */
    if(form.$valid){
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

          var uid = userData['uid']
          var provider = userData['provider'];
          var profileImageURL = userData[provider]['profileImageURL'];
          
          var userData = $firebaseObject(ref.child('/users/'+uid));
          userData.$loaded(function(data){
              if(data.photoChanged===false){
                  /* make profile image available on firebase. */
                  ref.child('/users/' + uid ).update({'profileImageURL' : profileImageURL});
              }
          });

          /* IMPORTANT : redirect to valid state. */
          SideMenuStateService.setSignedIn(true);
          $state.go('tabs.tab-activity');
        }
      });
    }
  };

}])

.controller("ActivityCtrl", ['$scope', '$firebaseObject', function($scope, $firebaseObject){

  // create a reference to firebase database
  var ref = new Firebase("https://comp3990.firebaseio.com");

  $scope.profileData = null;

  $scope.init = function(){

    $scope.labels = ["Revenue", "Total Views For All Products", "Total Interests For All Products"];
    $scope.data = [0,0,0];
    $scope.type = 'PolarArea';
    $scope.totalInterests = 0;

      var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));

      if(localData !== null){
        var uid = localData['uid'];
        /* get profile data from firbase. */
        $scope.profileData = $firebaseObject(ref.child('/users/' + uid));
      }

      $scope.revenue = $firebaseObject(ref.child('/analytics/revenue/' + uid));

      $scope.revenue.$loaded(function(data){
        $scope.$watch('revenue.totalRevenue', function handleChange(newValue, oldValue){
                $scope.data[0] = newValue;
          });
      });

      $scope.globalViews = $firebaseObject(ref.child('/analytics/products-unique-views/' + uid + '/globalViews'));
      $scope.globalViews.$loaded(function(data){
        $scope.$watch('globalViews.$value', function handleChange(newValue, oldValue){
                $scope.data[1] = newValue;
          });
      });

      $scope.globalInterests = $firebaseObject(ref.child('/analytics/products-interest/' + uid + '/globalInterests'));
      $scope.globalInterests.$loaded(function(data){
        $scope.$watch('globalInterests.$value', function handleChange(newValue, oldValue){
                $scope.data[2] = newValue;
          });
      });
  };


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

  // this field indicates to potenital buyers that this item is still on the market to be interested in
  $scope.item.status = "available";

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
        quality : 75,
        targetWidth : 250,
        targetHeight : 250,
        saveToPhotoAlbum : false,
        correctOrientation : true
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

.controller('ProfilePicCtrl', ['$scope', '$state', '$firebaseObject', '$cordovaCamera', function($scope, $state, $firebaseObject, $cordovaCamera){

  // create a reference to firebase database
  var ref = new Firebase("https://comp3990.firebaseio.com");

  // get user uid that is currently logged in
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  var uid = localData['uid'];

  /* get profile data from firbase. */
  $scope.profileData = $firebaseObject(ref.child('/users/' + uid));

  $scope.pictureTaken = false;
  $scope.photo_choice = 0;

  // this function will allow the user to take a photo with the device's camera
  $scope.takePicture = function(){

    ionic.Platform.ready(function(){
      // will execute when device is ready, or immediately if the device is already ready.
      console.log("device ready");
      // specifiying camera options

      var options = {};

      // camera chosen as source
      if($scope.photo_choice == 1){
        console.log("camera chosen");
        options = {
          cameraDirection : 0,                                              // specify use rear camera
          sourceType : 1,                                                    // 0 indicates to use picture from album, 1 indicates to use camera
          encodingType : 0,                                                 // specify the image is encoded as a jpeg
          destinationType : 0,                                              // specify format of value returned is Base64 encoded string
          quality : 75,                                                     // quality of the saved image, can range from 0-100
          targetWidth : 128,                                                // width to scale image (pixels)
          targetHeight : 128,                                               // height to scale image (pixels)
          saveToPhotoAlbum : false,
          correctOrientation : true
        };
      }

      // photo library chosen as source
      else{
        console.log("album chosen");
        options = {
          sourceType : 0,
          mediaType: 0,
          destinationType : 0                                              // specify format of value returned is Base64 encoded string
        };
      }


      $cordovaCamera.getPicture(options).then(function(imageData) {
        // imageData is the Base64 encoded string of the image
        console.log("Photo taken successfully");
        console.log(imageData);
        $scope.picture = imageData;
        $scope.pictureTaken = true;

      }, function(error) {
        // error occured
        console.log("Error: " + error);
      });

    });
  };

  $scope.savePicture = function(){
    //update firebase with new attributes for this user
    ref.child('users/' + uid + '/' + 'photoChanged').set(true);
    ref.child('users/' + uid + '/' + 'profileImageURL').set($scope.picture);

    // redirect to profile page
    $state.go('tabs.tab-activity');
  };

}])

.controller('HomeCtrl',['$scope', '$firebaseArray', function($scope, $firebaseArray){
    var ref = new Firebase("https://comp3990.firebaseio.com");
    $scope.allProducts = $firebaseArray(ref.child('/products'));

}])

.controller('ShopCtrl',['$scope', '$firebaseArray', function($scope, $firebaseArray){


}])

.controller('ViewItemCtrl', ['$scope', '$firebaseObject', 'UserProductsService', function($scope, $firebaseObject, UserProductsService){

    var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
    $scope.userId = localData['uid'];
    $scope.allProducts = {};
    $scope.loadProducts = function(){
        UserProductsService.$bindTo($scope,"allProducts");
    }


}])


.controller('ItemDetailCtrl', ['$scope', '$stateParams' ,'$firebaseObject', '$http', '$ionicModal', '$state', '$ionicPopup',function($scope, $stateParams, $firebaseObject, $http, $ionicModal, $state, $ionicPopup){
  /* firebase reference*/
  var ref = new Firebase("https://comp3990.firebaseio.com");
  var selectedPaymentMethod;

    $scope.setupGraph = function(){
      /* graph setup */
      $scope.labels = ['Unique Views', 'Interests'];
      $scope.series = ['Total'];
      $scope.data = [[0,0]];
    };


    $scope.init = function(){

      /* get the sellerId from stateParms */
      $scope.sellerId= $stateParams.userId;
      $scope.productId = $stateParams.productId;
      /*
        the seller will see additional info such as analytics which will not be seen by buyers.
        If the seller is viewing, we would display this additional information.
      */
      var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));

      if(localData !== null){
        $scope.loggedInUserId = localData['uid'];

        if($scope.loggedInUserId === $scope.sellerId){
          $scope.isSeller = true;
        }
        else{
          $scope.isSeller = false;
        }
      }

      //call on the logUserView to add data to analytics.
      $scope.logUserView();
      $scope.loadProductInterests();
    };

    $scope.loadProductInterests = function(){
      var logInterestRef = ref.child('/analytics/products-interest/' + $scope.sellerId + '/' + $scope.productId);
      $scope.productInterests = $firebaseObject(logInterestRef);
      $scope.productInterests.$loaded(function(data){
        $scope.$watch('productInterests.totalInterests', function handleChange(newValue, oldValue){
                $scope.data[0][1] = newValue;
          });
      });

    };
    $scope.logUserInterest = function(){
      var logGlobalInterestsRef = ref.child('/analytics/products-interest/' + $scope.sellerId + '/globalInterests');
      if($scope.isSeller === false){

          if($scope.productInterests[$scope.loggedInUserId] == null){
            /* user is interested in the item. */
            $scope.productInterests[$scope.loggedInUserId] = true;

            if($scope.productInterests.totalInterests == null){
              $scope.productInterests.totalInterests = 1;
            }
            else{
              $scope.productInterests.totalInterests = $scope.productInterests.totalInterests + 1;
            }
            $scope.productInterests.$save();

            $scope.globalInterests = $firebaseObject(logGlobalInterestsRef);

            $scope.globalInterests.$loaded(function(data){
              if(data.$value == null){
                data.$value = 1;
              }
              else{
                data.$value = data.$value + 1;
              }

              data.$save();
            });
          }

          console.log("This interest will be added to analytics");
        }
        else{
          console.log("The seller cannot be interested in the item.");
        }

    };

    /* this function adds a unique view to the analytics section */
    $scope.logUserView = function(){

      var logViewRef = ref.child('/analytics/products-unique-views/' + $scope.sellerId + '/' + $scope.productId);

      var logGlobalViewsRef = ref.child('/analytics/products-unique-views/' + $scope.sellerId + '/globalViews');

      $scope.productUniqueViews = $firebaseObject(logViewRef);

      $scope.productUniqueViews.$loaded(function(data){

        $scope.$watch('productUniqueViews.totalUniqueViews', function handleChange(newValue, oldValue){
                $scope.data[0][0] = newValue;
          });

          if($scope.isSeller === false){

            if(data[$scope.loggedInUserId] == null){
              /* since this is the first time the user is viewing the item, add their id to the views. */
              data[$scope.loggedInUserId] = true;

              /* update the unique view counter. */
              /* if the views are not set from before, this is the first viewer. */
              if(data.totalUniqueViews == null){
                data.totalUniqueViews = 1;
              }
              else{
                /* already set, so increment by 1.*/
                data.totalUniqueViews = data.totalUniqueViews + 1;

              }
                data.$save();

                $scope.globalViews = $firebaseObject(logGlobalViewsRef);
                $scope.globalViews.$loaded(function(data){

                  if(data.$value == null){
                    data.$value = 1;
                  }
                  else{
                    data.$value = data.$value + 1;
                  }

                  data.$save();
                });
            }

            console.log("This view counts toward analytics if it is unique.");
        }
        else{
          console.log("The seller is viewing the item, this view does not count towards analytics.");
        }
      });

    };

    $ionicModal.fromTemplateUrl('templates/modal-view.html', {
    scope: $scope,
    animation: 'slide-in-up'
    }).then(function(modal) {
    $scope.modal = modal;
    });

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    //Set up rating for rating object on UI side
    $scope.rating = {};
    $scope.userRating={rating: 0, comment:''};

    //NOT SURE IF THESE VAIRABLES ARE USED WITHIN THE CONTROLLER.
    var userId= $stateParams.userId;
    var productId= $stateParams.productId;

    $scope.interestedButtonMessage="Interested";

    $scope.transaction = {};
    $scope.message = {};

    /* get the userid of the person selling the product, as well as the product id. */
    $scope.sellerId= $stateParams.userId;
    $scope.productId= $stateParams.productId;

    //pull seller information for quick overview of seller details.
    $scope.sellerInfo = $firebaseObject(ref.child('/users/'+$scope.sellerId));


    /* access localStorage to get the loggedin user's userid. */
    var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));

    $scope.buyerId = localData['uid'];
    /* place the uid in the message object to know who sent the message. */

    $scope.message.sender = $scope.buyerId;
    $scope.users = $firebaseObject(ref.child('/users'));
    /* this function runs when user clicks on the interested button */


    $scope.interestedButton = function(){
        if($scope.buyerId===$scope.sellerId){
             $scope.interestedButtonMessage="You cannot be interested in your own item.";
        }
        else{
          $scope.logUserInterest();
          $scope.interestExists = $firebaseObject(ref.child('/interests/' + $scope.sellerId + '/' + $scope.productId));
          $scope.interestExists.$loaded(function(data){
            if(data.$value!==null){
                console.log("You are already interested in this item!");
                $scope.interestedButtonMessage="You are already interested in this item";
            }
            else{
               /* create a product interest on firebase. */
                var transactionRef = ref.child('/interests/' + $scope.sellerId + '/' + $scope.productId + '/' + $scope.buyerId);
                /* push data to firebase. */

                transactionRef.child('/messages').push($scope.message);

                //find out which payment method was selected.
                var paymentObj = {paymentMethod : selectedPaymentMethod};

                transactionRef.update(paymentObj);
                console.log($scope.buyerId);
                console.log($scope.users[$scope.buyerId]);
                var pushId = $scope.users[$scope.sellerId].pushId;
                var username = $scope.users[$scope.buyerId]['name'];
                console.log("Attempting push notification on interest.");
                $http.get("http://mas-health.com/gcm.php?id=" + pushId + "&title=Campus Deals&message=" + username +  " is interested in an item you have for sale.");

                //Check and push state information if it does not exist.
                $scope.stateInfo = $firebaseObject(ref.child('/interests/' + $scope.sellerId + '/' + $scope.productId + '/statusInformation/'));
                $scope.stateInfo.$loaded(function(data){
                    if(data.$value!==null){
                        console.log(data);
                    }
                    else{
                        var stateInfoRef = ref.child('/interests/'+ $scope.sellerId + '/' + $scope.productId);
                        $scope.stateInformation={};
                        //addition of new field to indicate the chosen buyer
                        $scope.stateInformation.selectedBuyer = "N/A";
                        //addition of a status for the interest
                        $scope.stateInformation.status = "Available";
                        stateInfoRef.child('/statusInformation').set($scope.stateInformation);
                        //Update the interests by adding 1 to the value in the firebase
                        var productRef = ref.child('/products/'+$scope.sellerId+'/'+$scope.productId);
                        $scope.product = $firebaseObject(productRef);
                        $scope.product.$loaded(function(data){
                            console.log(data.interested);
                            productRef.child('/interested').set(data.interested+1);
                        });
                    }
                });
                 // redirect user to category page.
                 $state.go('tabs.tab-shop');
            }
        });
        }
    };

    /* information of the specific item is now lodaded ionto the page via scope */
    $scope.itemDetails = $firebaseObject(ref.child('/products/'+$scope.sellerId+'/'+$scope.productId+''));

    $scope.checkPaymentItem=function(key){
        selectedPaymentMethod = key.charAt(0).toUpperCase() + key.slice(1);;
    }


}])

.controller('CategoryListCtrl',['$scope','$firebaseObject', '$stateParams','AllProductsService', function($scope, $firebaseObject, $stateParams, AllProductsService){
     $scope.category=$stateParams.category;
    //  $scope.allProducts = {};
    //  $scope.loadProducts = function(){
    //      AllProductsService.$bindTo($scope,"allProducts");
    //  }
    var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
    $scope.userId = localData['uid'];

    var ref = new Firebase("https://comp3990.firebaseio.com");
    $scope.allProducts = $firebaseObject(ref.child('/products'));

}])

.controller('SideMenuCtrl', ['$scope', '$ionicSideMenuDelegate', 'SideMenuStateService', '$state', function($scope, $ionicSideMenuDelegate, SideMenuStateService, $state){

  $scope.isSignedIn = false;

  $scope.showMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.checkSignedIn = function(){
    return SideMenuStateService.getSignedIn();
  };

  $scope.signOut = function(){
    var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
    /* delete session data and set side menu state to reflect correct options.*/
    if(localData !== null){
      localStorage.removeItem('firebase:session::comp3990');
      SideMenuStateService.setSignedIn(false);
    }

  };

}])


.controller('NewItemInterestedCtrl', ['$scope', '$stateParams', '$firebaseObject', '$http', function($scope, $stateParams, $firebaseObject, $http){


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

  /* get the users information, cause we seller info*/
  $scope.users = $firebaseObject(ref.child('/users/'))

  /* this function runs when user clicks on the interested button */
  $scope.interestedButton = function(){

    var pushId = $scope.users[$scope.sellerId].pushId;

    $http.get("http://mas-health.com/gcm.php?id=" + pushId + "&title=Campus Deals&message=You Received a New Message From a User.");
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

.controller('BuyerInterestedItemOverviewCtrl', ['$scope', '$state', '$stateParams', '$firebaseObject', 'PaypalService', function($scope, $state, $stateParams, $firebaseObject, PaypalService){
   //Set both sets of information to be displayed to false
   $scope.allowedToBuyPositive=false;
   $scope.allowedToBuyNegative=false;

  //get the user's ID
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  $scope.buyerIdLocalStorage = localData['uid'];

  /* get the information passed over from the previous page. */
  $scope.sellerId = $stateParams.sellerId;
  $scope.buyerId = $stateParams.buyerId;
  $scope.productId = $stateParams.productId;
  $scope.perspective = $stateParams.perspective;

  /* firebase reference*/
  var ref = new Firebase("https://comp3990.firebaseio.com");
  $scope.interestsRef = $firebaseObject(ref.child('/interests/' + $scope.sellerId + '/' + $scope.productId + '/statusInformation' ));

  // download the information of buy proposal for this buyer
  $scope.buyProposal = $firebaseObject(ref.child('interests').child($scope.sellerId).child($scope.productId).child($scope.buyerId));

  // download all info on the product to be bought
  $scope.productInfo = $firebaseObject(ref.child('products').child($scope.sellerId).child($scope.productId));

  // download all info on the seller
  $scope.userInfo = $firebaseObject(ref.child('users').child($scope.sellerId));

  // download revenue analytics on the seller
  $scope.sellerRevenue = $firebaseObject(ref.child('/analytics/revenue/' + $scope.sellerId));

  var productPrice=0.0;

  $scope.interestsRef.$loaded(function(data){
      //item is unavailable and id matches
      if(data.status === "unavailable" && data.selectedBuyer===$scope.buyerId){
          $scope.allowedToBuyPositive=true;
      }
      //item is unavailable and id does not match
      else if(data.status === "unavailable" && data.selectedBuyer!==$scope.buyerId){
          $scope.allowedToBuyNegative=true;
      }
      //item is avaialble
      else{

      }
  });

  $scope.processPaypal = function(){
    console.log("initiating paypal payment process");

    // when the product info is ready to be used
    $scope.productInfo.$loaded(function(data){
      productPrice = data.price;
      // when seller data is ready to be used
      $scope.userInfo.$loaded(function(userData){
        PaypalService.initPaymentEnv(userData.email).then(function(){
          console.log("initializing sandbox environment" + data.price + " " + data.name);
          PaypalService.makePayment(data.price, data.name).then(onPaymentSuccess, onPaymentFail);
        });
      });
    });
  }

  function onPaymentSuccess(result){
    console.log(result);

    // change product status to reflect that has been sold
    updateProductStatus();

    // update revenue in analytics
    // $scope.sellerRevenue.$loaded(function(data){
    //   console.log("HELLO");
    //   // revenue info already exists for this seller
    //   if(data.$value!==null){
    //     // get current revenue
    //     var currentRevenue = data.totalRevenue;
    //     ref.child('/analytics/' + 'revenue/' + $scope.sellerId + '/' + 'totalRevenue').set(currentRevenue + productPrice);    
    //   }
      
    //   // revenue info for this seller is not yet available 
    //   else{
          
    //     ref.child('/analytics/' + 'revenue/' + $scope.sellerId + '/' + 'totalRevenue').set(productPrice);
    //   }
    // });

    attemptDeleteInterests();

    // add record to history
    var buyerHistoryRef = ref.child('history/' + $scope.buyerId + '/' + $scope.sellerId + '/' + $scope.productId);
    var currDate = (new Date()).toString();
    var record = {"date" : currDate};
    // push data to firebase
    buyerHistoryRef.set(record);

    $scope.generatePendingReviewPaypal();
    //redirect to home page
    $state.go('menu-buying');
  }

  function onPaymentFail(error){
    console.log(error);
  }

  $scope.cashComplete = function(){
    // change product status to reflect that has been sold
    updateProductStatus();

    attemptDeleteInterests();

    // add record to history
    var buyerHistoryRef = ref.child('history/' + $scope.buyerId + '/' + $scope.sellerId + '/' + $scope.productId);
    var currDate = (new Date()).toString();
    var record = {"date" : currDate};
    // push data to firebase
    buyerHistoryRef.set(record);

    $scope.generatePendingReviewCash();

    //redirect to home page
    $state.go('tabs.tab-activity');
  }

  $scope.generatePendingReviewCash = function (){
    //upon completing a transaction, a pending review of the buyer will need to be done
    //this will need to be reflected in the viewing of a user's account.

    console.log("CREATING PENDING STUFF!");
    //We also need to post a pending review here!
     //add a pending review
    var purchaseDate = (new Date()).toString();
    ref.child('/pending-reviews/'+$scope.buyerId +'/'+$scope.sellerId).set({buyer:false, itemName:$scope.productInfo.name, itemPicture:$scope.productInfo.picture, dateDueSince:purchaseDate});
    //increment number of pending reviews on user profile by 1
    $scope.userData = $firebaseObject(ref.child('/users/'+$scope.buyerId));
    $scope.userData.$loaded(function(data){
        var numPendingReviews = data.pendingReviews+1;
        ref.child('/users/'+$scope.buyerId+'/pendingReviews').set(numPendingReviews);
    });
  }

  $scope.generatePendingReviewPaypal = function (){
    //upon completing a transaction, a pending review of the buyer will need to be done
    //add a pending review for the buyer
    var purchaseDate = (new Date()).toString();
    ref.child('/pending-reviews/'+$scope.buyerId +'/'+$scope.sellerId).set({buyer:false, itemName:$scope.productInfo.name, itemPicture:$scope.productInfo.picture, dateDueSince:purchaseDate});
    //increment number of pending reviews on user profile by 1
    $scope.userData = $firebaseObject(ref.child('/users/'+$scope.buyerId));
    $scope.userData.$loaded(function(data){
        var numPendingReviews = data.pendingReviews+1;
        ref.child('/users/'+$scope.buyerId+'/pendingReviews').set(numPendingReviews);
    });

    // generate pending review for seller
    ref.child('/pending-reviews/'+$scope.sellerId +'/'+$scope.buyerId).set({buyer:true, itemName:$scope.productInfo.name, itemPicture:$scope.productInfo.picture, dateDueSince:purchaseDate});
    //increment number of pending reviews on user profile by 1
    $scope.userData = $firebaseObject(ref.child('/users/'+$scope.sellerId));
    $scope.userData.$loaded(function(data){
        var numPendingReviews = data.pendingReviews+1;
        ref.child('/users/'+$scope.sellerId+'/pendingReviews').set(numPendingReviews);
    });
  }

  function updateProductStatus(){

    $scope.productInfo.$loaded()
      .then(function(data){
        data.status = "sold";

        $scope.productInfo.$save()
          .then(function(ref){
            console.log("updated product status to sold");
          }, function(error){
            console.log("Failed to update product status " + error);
          });
      })
      .catch(function(error){
        console.log("Error:" + error);
      });
  }

  function attemptDeleteInterests(){
    // delete interests
    var refInterests = new Firebase("https://comp3990.firebaseio.com/interests/" + $scope.sellerId + "/" + $scope.productId);

    $scope.buyProposal.$loaded().then(function(data){
      if(data.paymentMethod === 'Paypal'){
          // it is safe to remove interests immediately
          refInterests.remove();
      }
      // method is cash
      else{
        // check whether both seller and buyer have agreed that transaction is completed before deleting
        $scope.interestsRef.$loaded().then(function(data){
          if(data.sellerAgreed === true){
            // seller has already agreed that the transaction is completed, therefore we delete the interests
            refInterests.remove();
            
            // // update revenue in analytics
            // $scope.sellerRevenue.$loaded(function(data){
            //     console.log("HELLO");
            //     // revenue info already exists for this seller
            //     if(data.$value!==null){
            //         // get current revenue
            //         var currentRevenue = data['totalRevenue'];
            //         ref.child('/analytics/' + 'revenue/' + $scope.sellerId + '/' + 'totalRevenue').set(currentRevenue + productPrice);    
            //     }
                
            //     // revenue info for this seller is not yet available 
            //     else{
                   
            //         ref.child('/analytics/' + 'revenue/' + $scope.sellerId + '/' + 'totalRevenue').set(productPrice);
            //     }
            // });
          }
          else{
            // seller has yet to agree that transaction is complete so we update this field to reflect that the buyer has agreed
            data.buyerAgreed=true;
            $scope.interestsRef.$save()
              .then(function(ref){
                console.log("updated buyer agreed status to 'true'");
              }, function(error){
                console.log("Failed to update buyer agreed status " + error);
            });
          }
        });
      }
    });

  }

}])

.controller('MessengerCtrl', ['$scope', '$stateParams', '$firebaseObject', '$ionicScrollDelegate', '$http', function($scope, $stateParams, $firebaseObject, $ionicScrollDelegate, $http){

  /* firebase reference*/
  var ref = new Firebase("https://comp3990.firebaseio.com");
  /* uid reference. */
  var uid = null;


  /* get the data sent over by stateParams. */
  $scope.sellerId = $stateParams.sellerId;
  $scope.buyerId = $stateParams.buyerId;
  $scope.productId = $stateParams.productId;
  $scope.perspective = $stateParams.perspective;
  $scope.otherUser = null;
  $scope.me = null;
  $scope.chatText = null;
  $scope.username = null;

  $scope.init = function(){

    /* pull the interests list. */
    $scope.messages = $firebaseObject(ref.child('/interests/' + $scope.sellerId + '/' + $scope.productId + '/' + $scope.buyerId + '/messages'));
    /* pull the users list. */
    $scope.users = $firebaseObject(ref.child('/users'));

    /* get the logged in user. */
    var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
    uid = localData['uid'];

    var userDataRef = ref.child('/users/' + uid);

    userDataRef.once("value", function(data){
      $scope.username = data.val().name
    });

    /* this block of code figures out the next user in the chat, so we can send push notifications. */
    if(uid == $scope.sellerId){
      $scope.otherUser = $scope.buyerId;

    }
    else{
      $scope.otherUser = $scope.sellerId;
    }

  };

  /* this function decides which css class to apply to each message. */
  $scope.messageClass = function(sender){
    /* this makes the chat scroll automatically to the bottom of the chat. */
    $ionicScrollDelegate.scrollBottom();
    /* figures out which css class to apply. */
    if(sender === uid){
      $scope.me = uid;
      return true;
    }
    else if(sender !== uid){
      $scope.me = uid;
      return false;
    }

  };

  $scope.sendMessage = function(message){
    /* stores message to firebase */
    ref.child('/interests/' + $scope.sellerId + '/' + $scope.productId + '/' + $scope.buyerId + '/messages').push({
      sender : $scope.me,
      text : message
    });

    /* clear chatText */
    $scope.chatText = "";

    /* get my name to include in the push notification */

    /* send the other user a notification */

    var pushId = $scope.users[$scope.otherUser].pushId;
    $http.get("http://mas-health.com/gcm.php?id=" + pushId + "&title=Campus Deals&message=You Received a New Message From " + $scope.username);
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
  $scope.sellerId = uid;
  $scope.productId = productId;

  // download all the users to use as a crossreference
  $scope.users = $firebaseObject(firebaseRef.child('users'));

}])


//This is the new controller for the ratings.
.controller('UserRatingCtrl2', ['$scope', '$stateParams', '$firebaseObject', function($scope, $stateParams, $firebaseObject){
  //Setup firebase reference
  var ref = new Firebase("https://comp3990.firebaseio.com");

  //Set up rating for rating object on UI side
   $scope.rating = {};
   $scope.userRating={rating: 0, comment:'',userName:'', date:''};

  //Obtain buyer and seller ID's
  var buyerId = $stateParams.buyerId;
  var sellerId = $stateParams.sellerId;
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  var uid = localData['uid'];

  //Determine if current user is the buyer or seller
  var seller=false;

  //set up necessary variables for displaying information on the UI
  $scope.userType="";
  $scope.userData={};
  var userIdRef;
  var userCurrentRating;
  var userPendingReviews;

  //If the user on the device is the seller, we need to post a review about the buyer and vice versa.
  var newRef;
    if(uid===buyerId){
      //we are doing a review for a seller
      $scope.userType="Seller";
      userIdRef=sellerId;
      newRef = $firebaseObject(ref.child('/users/'+buyerId));
      //get pending reviews and name for the buyer(person that is doing the reviewing)
      newRef.$loaded(function(data){
          userPendingReviews = parseInt(data.pendingReviews);
          $scope.userRating.userName=data.name;
      });
    }
    else if(uid===sellerId){
      //we are doing a review for a buyer.
      $scope.userType="Buyer";
      userIdRef=buyerId;
      seller=true;
      newRef = $firebaseObject(ref.child('/users/'+sellerId));
      //get pending reviews and name for the seller(person that is doing the reviewing)
      newRef.$loaded(function(data){
          userPendingReviews = parseInt(data.pendingReviews);
          $scope.userRating.userName=data.name;
      });
    }

    //pull the overall rating of the user that is to be commented on.
    $scope.userData = $firebaseObject(ref.child('/users/'+userIdRef));
    $scope.userData.$loaded(function(data){
        userCurrentRating = parseFloat(data.overallRating);
    });
    

  $scope.postRating=function(){
      //console.log("PENDING----"+userPendingReviews);
      var ratingRef = ref.child('/ratings/');
      var userRatingRef = ref.child('/users/'+userIdRef+'/overallRating');
      var newRating=0.00;
      if(parseFloat(userCurrentRating)===0){
          newRating = parseFloat($scope.userRating.rating);
      }
      else{
          newRating = (parseFloat(userCurrentRating) + parseFloat($scope.userRating.rating))/2;
      }
      var pendingReviewsRef, pendingReviewRefToRemove;
      if(seller===true){
        $scope.userRating.date = (new Date()).toString();
        ratingRef.child(buyerId+'/'+sellerId+'/').push($scope.userRating);
        pendingReviewsRef = ref.child('/users/'+sellerId+'/pendingReviews');
        pendingReviewsRef.set(userPendingReviews-1);
        userRatingRef.set(newRating);
        //removing pending review.
        pendingReviewRefToRemove = ref.child('/pending-reviews/'+sellerId+'/'+buyerId);
        pendingReviewRefToRemove.remove();
      }
      else{
        $scope.userRating.date = (new Date()).toString();
        ratingRef.child(sellerId+'/'+buyerId+'/').push($scope.userRating);
        pendingReviewsRef = ref.child('/users/'+buyerId+'/pendingReviews');
        pendingReviewsRef.set(userPendingReviews-1);
        userRatingRef.set(newRating);
        //removing pending review.
        pendingReviewRefToRemove = ref.child('/pending-reviews/'+buyerId+'/'+sellerId);
        pendingReviewRefToRemove.remove();
      }
  }
}])

.controller('PendingReviewsCtrl',['$scope','$firebaseObject','$state', function($scope,$firebaseObject,$state){
    // create a reference to firebase database
    var ref = new Firebase("https://comp3990.firebaseio.com/");
    var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
    $scope.uid = localData['uid'];
    $scope.allPendingReviews = $firebaseObject(ref.child('/pending-reviews/'+$scope.uid));
    $scope.allPendingReviews.$loaded(function(data){
        console.log(data);
    });

    $scope.uidCheck=function(key){
        return (key===$scope.uid);
    }

    $scope.goToRatings=function(key,value){
        console.log("KEY IS"+key);
        if(value.buyer===true){
             console.log("This is the seller!");
             $state.go('rateuser2',{'buyerId':key, 'sellerId' : $scope.uid});
        }
        else{
            console.log("This is the buyer!");
             $state.go('rateuser2',{'buyerId':$scope.uid, 'sellerId' : key});
        }
    }
}])

.controller('UserViewReviewsCtrl',['$scope','$firebaseObject','$stateParams', function($scope,$firebaseObject,$stateParams){
     $scope.sellerId= $stateParams.sellerId;
     var ref = new Firebase("https://comp3990.firebaseio.com/");
     $scope.sellerInfo = $firebaseObject(ref.child('/users/'+$scope.sellerId));
     $scope.sellerReviews = $firebaseObject(ref.child('/ratings/'+$scope.sellerId));
}])


.controller('InterestedOverviewCtrl', ['$scope', '$state', '$stateParams', '$firebaseObject', function($scope, $state, $stateParams, $firebaseObject){

  $scope.buyerId = $stateParams.buyerId;
  $scope.sellerId = $stateParams.sellerId;
  $scope.productId = $stateParams.productId;
  $scope.perspective = "seller";

  // create a reference to firebase database
  var firebaseRef = new Firebase("https://comp3990.firebaseio.com/");

  // download the information on buy proposal for this buyer
  $scope.buyProposal = $firebaseObject(firebaseRef.child('interests').child($scope.sellerId).child($scope.productId).child($scope.buyerId));

  // download the particular product from products data
  $scope.chosenProduct = $firebaseObject(firebaseRef.child('products').child($scope.sellerId).child($scope.productId));

  // download the particular product from interests
  $scope.interestedItem = $firebaseObject(firebaseRef.child('interests').child($scope.sellerId).child($scope.productId).child('statusInformation'));

  // download info on buyer
  $scope.buyer = $firebaseObject(firebaseRef.child('users').child($scope.buyerId));

  // download state information on the interests for this item
  $scope.interestsRef = $firebaseObject(firebaseRef.child('/interests/' + $scope.sellerId + '/' + $scope.productId + '/statusInformation' ));

  // download revenue analytics on the seller
  $scope.sellerRevenue = $firebaseObject(firebaseRef.child('analytics/' + 'revenue/' + $scope.sellerId));

  var productPrice=0.0;

  $scope.buyerChosen = function(){
    console.log("User " + $scope.buyerId + "chosen as buyer");

    updateProduct();
    updateInterestedProduct();
  }

  $scope.completeTransaction = function(){
    console.log("transaction complete");
    //upon completing a transaction, a pending review of the buyer will need to be done
    //this will need to be reflected in the viewing of a user's account.

    console.log("CREATING PENDING STUFF!");
    //We also need to post a pending review here!

    //add a pending review for a cash transaction
    var purchaseDate = (new Date()).toString();
    firebaseRef.child('/pending-reviews/'+$scope.sellerId +'/'+$scope.buyerId).set({buyer:true, itemName:$scope.chosenProduct.name, itemPicture:$scope.chosenProduct.picture, dateDueSince:purchaseDate});
    
    
    //increment number of pending reviews on user profile by 1
    $scope.userData = $firebaseObject(firebaseRef.child('/users/'+$scope.sellerId));
    $scope.userData.$loaded(function(data){
        var numPendingReviews = data.pendingReviews+1;
        firebaseRef.child('/users/'+$scope.sellerId+'/pendingReviews').set(numPendingReviews);
    });

    attemptDeleteInterests();

    // redirect seller
    $state.go('tabs.tab-activity');
  }

  function updateProduct(){

    $scope.chosenProduct.$loaded()
      .then(function(data){
        data.status = "unavailable";
        productPrice = data.price;

        $scope.chosenProduct.$save()
          .then(function(firebaseRef){
            console.log("updated product status");
          }, function(error){
            console.log("Failed to update product status " + error);
          });
      })
      .catch(function(error){
        console.log("Error:" + error);
      });
  }

  function updateInterestedProduct(){

    $scope.interestedItem.$loaded()
      .then(function(data){
        data.status = "unavailable";
        data.selectedBuyer = $scope.buyerId;
        data.buyerAgreed = false;
        data.sellerAgreed = false;

        $scope.interestedItem.$save()
          .then(function(firebaseRef){
            console.log("updated interested product status");
          }, function(error){
            console.log("Failed to update interested product status " + error);
          });
      })
      .catch(function(error){
        console.log("Error:" + error);
      });
  }

  function attemptDeleteInterests(){
    // delete interests
    var refInterests = new Firebase("https://comp3990.firebaseio.com/interests/" + $scope.sellerId + "/" + $scope.productId);
    console.log("ATTEMPT DELETE.");
    // check whether both seller and buyer have agreed that transaction is completed before deleting
    $scope.interestsRef.$loaded().then(function(data){
      if(data.buyerAgreed === true){
          console.log("REMOVING.");
        // buyer has already agreed that the transaction is completed, therefore we delete the interests
        refInterests.remove();

        // update revenue in analytics
        // $scope.sellerRevenue.$loaded(function(data){
        //   var currentRevenue = data.totalRevenue;
        //   firebaseRef.child('analytics/' + 'revenue/' + $scope.sellerId + '/' + 'totalRevenue').set(currentRevenue + productPrice);
        // });
        
            // update revenue in analytics
        // $scope.sellerRevenue.$loaded(function(data){
        // console.log("HELLO");
        // // revenue info already exists for this seller
        // if(data.$value!==null){
        //     // get current revenue
        //     var currentRevenue = data.totalRevenue;
        //     ref.child('/analytics/' + 'revenue/' + $scope.sellerId + '/' + 'totalRevenue').set(currentRevenue + productPrice);    
        // }
        
        // // revenue info for this seller is not yet available 
        // else{
            
        //     ref.child('/analytics/' + 'revenue/' + $scope.sellerId + '/' + 'totalRevenue').set(productPrice);
        // }
        // });
      }
      else{
        // buyer has yet to agree that transaction is complete so we update this field to reflect that the seller has agreed
        data.sellerAgreed=true;
        $scope.interestsRef.$save()
          .then(function(firebaseRef){
            console.log("updated seller agreed status to 'true'");
          }, function(error){
            console.log("Failed to update seller agreed status " + error);
        });
      }
    });
  }

}])

.controller('SellerSoldItemsCtrl', ['$scope', '$firebaseObject', function($scope, $firebaseObject){

  // create a reference to firebase database
  var firebaseRef = new Firebase("https://comp3990.firebaseio.com/");

  // get user uid that is currently logged in
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  var uid = localData['uid'];

  // download all products in database belonging to this user
  $scope.userProducts = $firebaseObject(firebaseRef.child('products' + '/' + uid));
}])

.controller('BuyerPurchasedItemsCtrl', ['$scope', '$firebaseObject', function($scope, $firebaseObject){
  // create a reference to firebase database
  var firebaseRef = new Firebase("https://comp3990.firebaseio.com/");

  // get user uid that is currently logged in
  var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
  var uid = localData['uid'];

  $scope.userId = uid;

  // download buyer history belonging to this user
  $scope.buyingHistory = $firebaseObject(firebaseRef.child('history' + '/' + $scope.userId));

  // download all products to cross reference product ids
  $scope.allProducts = $firebaseObject(firebaseRef.child('products'));
}])
