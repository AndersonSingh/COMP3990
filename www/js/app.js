// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

userPushNotificationId = null;

angular.module('starter', ['ionic', 'firebase','starter.controllers', 'starter.services','angular-toArrayFilter','ionic.rating'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    //push notifications
    var pushNotification;

    document.addEventListener("deviceready", function(){
    pushNotification = window.plugins.pushNotification;
    });

    if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
      pushNotification.register(
      successHandler,
      errorHandler,
      {
          "senderID":"462662367187",
          "ecb":"onNotification"
      });
    }
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

.config(function($stateProvider, $urlRouterProvider){

  $stateProvider

   .state('tabs',{
     url:'/tabs',
     abstract: true,
     templateUrl: 'templates/tabs-template.html'
   })

   .state('tabs.tab-activity', {
     url: '/activity',
     views: {
         'activity-tab': {
         templateUrl: 'templates/tab-activity.html',
         controller: 'ActivityCtrl'
         }
     }
   })

   .state('tabs.tab-shop', {
     url: '/shop',
     views: {
         'shop-tab': {
         templateUrl: 'templates/tab-shop.html',
         controller: 'ShopCtrl'
         }
     }
   })

   .state('tabs.tab-sell', {
     url: '/sell',
     views: {
         'sell-tab': {
         templateUrl: 'templates/tab-sell.html',
         controller:'SellingCtrl'
         }
     }
   })

   .state('seller-add-item', {
     url: '/seller-add-item',
     templateUrl: 'templates/seller-add-item.html',
     controller: 'SellerCtrl'
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


   .state('seller-view-items-sale', {
    url: '/seller-view-items-sale',
    templateUrl: 'templates/seller-view-items-sale.html',
    controller:'ViewItemCtrl'
  })

  .state('item-details', {
    url: '/item-details?userId&productId',
    templateUrl: 'templates/item-details.html',
    controller:'ItemDetailCtrl'
  })

  .state('list-items-category', {
    url: '/list-items-category?category',
    templateUrl: 'templates/list-items-category.html',
    controller:'CategoryListCtrl'
  })

  .state('new-item-interested', {
    url: '/new-item-interested?sellerId&productId',
    templateUrl: 'templates/new-item-interested.html',
    controller: 'NewItemInterestedCtrl'

  })

  .state('items-interested', {
    url: '/items-interested',
    templateUrl: 'templates/items-interested.html',
    controller: 'BuyerInterestedItemsCtrl'

  })

  .state('buyer-item-interested-overview', {
    url: '/buyer-item-interested-overview?sellerId&buyerId&productId&perspective',
    templateUrl: 'templates/buyer-item-interested-overview.html',
    controller: 'BuyerInterestedItemOverviewCtrl'
  })

  .state('messenger', {
    url: '/messenger?sellerId&buyerId&productId&perspective',
    templateUrl: 'templates/messenger.html',
    controller: 'MessengerCtrl'

  })

  .state('menu-selling', {
    url: '/menu-selling',
    templateUrl: 'templates/menu-selling.html'
  })

  .state('menu-buying', {
    url: '/menu-buying',
    templateUrl: 'templates/menu-buying.html'
  })

  .state('menu-settings', {
    url: '/menu-settings',
    templateUrl: 'templates/menu-settings.html'
  })

  .state('settings-email-setup', {
   url: '/settings-email-setup',
   templateUrl: 'templates/settings-email-setup.html',
   controller: 'EmailCtrl'
 })

 .state('settings-profile-pic', {
  url: '/settings-profile-pic-pic',
  templateUrl: 'templates/settings-profile-pic.html',
  controller: 'ProfilePicCtrl'
})

 .state('seller-interested-people', {
  url: '/seller-interested-people?prodId',
  templateUrl: 'templates/seller-interested-people.html',
  controller: 'InterestedSellerCtrl'
})

.state('seller-interested-overview', {
 url: '/seller-interested-overview?buyerId&sellerId&perspective&productId',
 templateUrl: 'templates/seller-interested-overview.html',
 controller: 'InterestedOverviewCtrl'
})

.state('rateuser2', {
 url: '/rateuser2?buyerId&sellerId',
 templateUrl: 'templates/rate-user2.html',
 controller: 'UserRatingCtrl2'
})

.state('view-pending-reviews', {
 url: '/view-pending-reviews',
 templateUrl: 'templates/view-pending-reviews.html',
 controller: 'PendingReviewsCtrl'
})

  $urlRouterProvider.otherwise('sign-in');

});

function onNotification(e) {

    switch( e.event )
    {
    case 'registered':
        if ( e.regid.length > 0 )
        {
            // Your GCM push server needs to know the regID before it can push to this device
            // here is where you might want to send it the regID for later use.
            console.log("regID = " + e.regid);
            userPushNotificationId  = e.regid;
        }
    break;

    case 'message':
        // if this flag is set, this notification happened while we were in the foreground.
        // you might want to play a sound to get the user's attention, throw up a dialog, etc.
        if ( e.foreground )
        {
          console.log("push notification came in while user in app.");
        }
        else
        {  // otherwise we were launched because the user touched a notification in the notification tray.
            if ( e.coldstart )
            {
              console.log("push notification cold start.");
            }
            else
            {
            }
        }
    break;

    case 'error':
        console.log("Error with push notification" + e.msg);
    break;

    default:
      console.log("Unknown push notification event received.");
    break;
  }
}

function errorHandler (error) {
    alert('error = ' + error);
}

function successHandler (result) {
    alert('result = ' + result);
}
