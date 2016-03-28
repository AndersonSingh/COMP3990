angular.module('starter.services', ['ionic'])

.service('SideMenuStateService',[function(){

  var signedIn = false;

  return{

    getSignedIn : function(){
      return signedIn;
    },

    setSignedIn : function(value){
      signedIn = value;
    }

  };

}])

.service('AllProductsService',['$firebaseObject', function($firebaseObject){
    var ref = new Firebase("https://comp3990.firebaseio.com/products");
    //var products = ref.child('/products');
    return $firebaseObject(ref);
}])

.service('UserProductsService',['$firebaseObject', function($firebaseObject){
    var localData = JSON.parse(localStorage.getItem('firebase:session::comp3990'));
    var uid = localData['uid'];
    //FORCE USER ID = 874d9189-4147-4795-a5f5-d28d9e9e5924
    //console.log(uid);
    var ref = new Firebase("https://comp3990.firebaseio.com/products/"+uid);
    return $firebaseObject(ref);
}])

.service('PaypalService', ['$q', '$timeout', '$filter', function($q, $timeout, $filter){

    // $q is a service that will allow us to run functions asynchronously more easily and access any return value when processing is complete
    // $filter is a service to access various filters for formatting data to be displayed to user

    var services = {
      initPaymentEnv: initPaymentEnv,
      createPayment: createPayment,
      configuration: configuration,
      onPayPalInit: onPayPalInit,
      makePayment: makePayment
    }

    // to hold Promise object to be able to know when initPaymentEnv is complete
    var initDefer;

    function initPaymentEnv(){
        // create a new Deferred object to gain access to the associated Promise object
        initDefer = $q.defer();
        ionic.Platform.ready(function(){
          // will execute when device is ready, or immediately if the device is already ready.

          // PayPal Mobile SDK can operate in different environments to facilitate development and testing. So we set the relevant ids for both
          var clientIds = {
            PayPalEnvironmentProduction : "mdls85@hotmail.com",
            PayPalEnvironmentSandbox : "AR8sguB-Mkv0xH5B10sRCEHvsQ3Wz7KINhneeAJffuoXDKop2ZmKd7EpaJI6KcEGgygeTiMGkILDTyRi"
          };

          // this method must be called to initialize the PayPal Mobile SDK
          PayPalMobile.init(clientIds, onPayPalInit);
        });

        // return the promise object
        return initDefer.promise;
    }

    function onPayPalInit(){
      ionic.Platform.ready(function(){

        // this must be done to preconnect to PayPal to prepare the device for processing payments.
        PayPalMobile.prepareToRender("PayPalEnvironmentSandbox", configuration(), onRender);
      });
    }

    // callback function to be used in onPayPalInit
    function onRender(){
      $timeout(function () {
        // resolves the derived promise from initPaymentEnv
        initDefer.resolve();
      });
    }

    // creates a PaypalPayment object
    function createPayment(amount, name){

      amount = "" + amount;
      name = "" + name;

      // follows the ISO 4217 currency codes
      var currencyCode = "USD";

      // equates to an immediate payment.
      var intent = "Sale";

      // PayPalPayment can take an optional PayPalPaymentDetails object to include details such as sub-total, shipping charge, and tax
      var payment = new PayPalPayment(amount, currencyCode, name, intent);

      // Returns the PayPalPayment object with the specified amount, currency code, and short description.
      return payment;
    }

    function configuration(){
      var settings = {
        merchantName : "UWI Buy Sell"
      };

      var config = new PayPalConfiguration(settings);
      return config;
    }

    // to hold Promise object to be able to know when makePayment is completed (successfully or not)
    var paymentDefer;

    function makePayment(amount, name){
      // create a new Deferred object to gain access to the associated Promise object
      paymentDefer = $q.defer();

      // formats the number 'amount' to a string inclusive of two decimal places from number
      amount = $filter('number')(amount, 2);

      ionic.Platform.ready(function(){

        // Start PayPal UI to collect payment from the user.
        PayPalMobile.renderSinglePaymentUI(createPayment(amount, name), onMakePaymentSuccess, onMakePaymentFail);
      });

      return paymentDefer.promise;
    }

    function onMakePaymentSuccess(result){
      $timeout(function(){
        // 'result' parameter will be passed to callback function
        paymentDefer.resolve(result);
      });
    }

    function onMakePaymentFail(error){
      $timeout(function(){
        // 'error' parameter will be passed to callback function
        paymentDefer.reject(error);
      });
    }

    return services;
}]);
