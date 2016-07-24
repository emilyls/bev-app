angular.module('starter.services', [])

.factory('Beverages', function ($http) {

    var urlBase = "http://bev-api.appspot.com/";
    var Beverages = {};

    Beverages.getAllBeverages = function () {
        return $http.get(urlBase + 'Beverage');
    };

    Beverages.getBeverage = function (bev_id) {
        return $http.get(urlBase + 'Beverage?id=' + bev_id);
    };

    Beverages.getAllStores = function () {
        return $http.get(urlBase + 'Store');
    };
   
    Beverages.addRating = function (ratingData) {
        return $http({
            method: 'PUT',
            url: urlBase + 'Rating',
            data: ratingData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    };

    Beverages.addPrice = function (priceData) {
        return $http({
            method: 'PUT',
            url: urlBase + 'Price',
            data: priceData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    };

    Beverages.addBeverage = function (beverageData) {
        return $http({
            method: 'POST',
            url: urlBase + 'Beverage',
            data: beverageData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    };

    Beverages.deleteBeverage = function (beverageID) {
        return $http.delete(urlBase + 'Beverage/' + beverageID);
    };

    return Beverages;

});
