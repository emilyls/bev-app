angular.module('bev_tracker.services', [])

.factory('LocalStorage', function ($localStorage) {
    LocalStorage = {};
    LocalStorage.loggedIn = false;

    LocalStorage.login = function (token) {
        $localStorage.user = token;
        LocalStorage.loggedIn = true;
    }

    LocalStorage.logout = function () {
        LocalStorage.loggedIn = false;
        delete $localStorage.token;
    }

    LocalStorage.getToken = function () {
        return $localStorage.user;
    }

    return LocalStorage;
})

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

    Beverages.getStoresByLocation = function (city, state, country) {
        return $http.get(urlBase + 'Store?city=' + city + '&state=' + state);
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

    Beverages.addStore = function (storeData) {
        return $http({
            method: 'POST',
            url: urlBase + 'Store',
            data: storeData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    };

    Beverages.deleteBeverage = function (beverageID) {
        return $http.delete(urlBase + 'Beverage/' + beverageID);
    };


    Beverages.getAccount = function (id_token) {
        return $http({
            url: urlBase + 'User',
            method: 'POST',
            params: { 'id_token': id_token }
        });
    }

    Beverages.addFavorite = function (id_token, favoriteData) {
        return $http({
            method: 'POST',
            url: urlBase + 'User',
            data: favoriteData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: { 'id_token': id_token }
        });
    };

    Beverages.deleteFavorite = function (favoriteID) {
        return $http.delete(urlBase + 'User/' + favoriteID);
    };

    Beverages.addNotes = function (id_token, favoriteData) {
        return $http({
            method: 'PUT',
            url: urlBase + 'User',
            data: favoriteData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            params: { 'id_token': id_token }
        });
    };


    return Beverages;

});
