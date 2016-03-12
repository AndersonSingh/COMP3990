// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase','starter.controllers', 'starter.services'])

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
         controller:'SellerCtrl'
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
  });

  $urlRouterProvider.otherwise('sign-in');

});
