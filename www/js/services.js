angular.module('starter.services', [])

.service('AllProductsService',['$firebaseObject', function($firebaseObject){
    var ref = new Firebase("https://comp3990.firebaseio.com/products");
    //var products = ref.child('/products');
    return $firebaseObject(ref);
}]);
