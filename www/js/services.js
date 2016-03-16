angular.module('starter.services', [])

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
    var ref = new Firebase("https://comp3990.firebaseio.com/products/874d9189-4147-4795-a5f5-d28d9e9e5924");
    return $firebaseObject(ref);
}]);
