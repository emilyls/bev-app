angular.module('bev_tracker.controllers', [])


.controller('AccountCtrl', function ($scope, $cordovaOauth, $http, LocalStorage, Beverages) {

    init();
    function init() {
        $scope.$on('$ionicView.enter', function (e) {
            getFavorites();
        });
    }

    function getFavorites() {
        $scope.loggedIn = LocalStorage.loggedIn;
        if ($scope.loggedIn) {
            var id_token = LocalStorage.getToken().id_token;
            Beverages.getAccount(encodeURI(id_token))
                .then(function (result) {
                    if (result.status = 200) {
                        $scope.favorites = result.data;
                    }
                }, function (error) {
                    console.log(error);
                });
        }
    }
     
    $scope.googleLogin = function () {
        $cordovaOauth.google("957738399987-9epk0j4jne0mgm829q0mhh5sec3cqbhd.apps.googleusercontent.com", ["https://www.googleapis.com/auth/userinfo.email"]).then(function (result) {
            if (result && !result.error) {
                LocalStorage.login(result);
                getFavorites();       
            }
        });
    }

    $scope.googleLogout = function () {
        LocalStorage.logout();
        $scope.loggedIn = LocalStorage.loggedIn;
        $scope.favorites = [];
    }

})

.controller('AccountDetailCtrl', function ($scope, $stateParams, Beverages, LocalStorage, $ionicModal, $ionicPopup, $state) {

    $scope.beverage = {};

    init();
    function init() {
        $scope.$on('$ionicView.enter', function (e) {
            getBeverage();
        });
    }

    function getBeverage() {
        $scope.beverage.bev_id = $stateParams.beverageId;
        $scope.beverage.bev_name = $stateParams.beverageName;
        $scope.beverage.brand_name = $stateParams.brandName;
        $scope.beverage.user_notes = $stateParams.userNotes;
    }

    $ionicModal.fromTemplateUrl('addNotes.html', {
        id: '1',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.oModal = modal;
    });

    $scope.openModal = function (index) {
        $scope.notes = $scope.beverage.user_notes;
        $scope.oModal.show();
    };
    $scope.closeModal = function (index) {
        $scope.oModal.hide();
    };
    $scope.$on('$destroy', function () {
        $scope.oModal.remove();
    });

    $scope.AddNotes = function (notes) {
        var notes_data = {};
        notes_data.favorite_id = parseInt($stateParams.beverageId, 10);
        notes_data.user_notes = notes;

        if (LocalStorage.loggedIn) {
            var id_token = LocalStorage.getToken().id_token;
            Beverages.addNotes(encodeURI(id_token), encodeData(notes_data))
                .then(function (result) {
                    $scope.beverage.user_notes = notes;
                    $stateParams.userNotes = notes;
                }, function (error) {
                    console.log(error);
                });
        }
        $scope.closeModal(1);
    };

    $scope.DeleteFavorite = function (favorite_id) {
        if (LocalStorage.loggedIn) {
            var id_token = LocalStorage.getToken().id_token;
            Beverages.deleteFavorite(id_token, encodeURI(favorite_id))
            .then(function (result) {
                $state.go('tab.account');
            }, function (error) {
                console.log(error);
            });
        }
    };

})






// Controller for adding a new beverage
.controller('NewCtrl', function ($scope, Beverages, $http) {

    $scope.stores;
    $scope.status;

    init();

    // Ensure the form is clear every time the tab is opened, no data is saved
    // if the user navigates to another tab
    function init() {
        $scope.$on('$ionicView.enter', function (e) {
            $scope.bev = {};
        });
    }
    
    $scope.AddBeverage = function (data) {
        var newBev = {};
        var newRating = {};

        if (data.bev_name && data.brand_name) {
            newBev.bev_name = data.bev_name;
            newBev.brand_name = data.brand_name;
        }
        if (data.value) {
            newRating.value = data.value;
            if (data.notes) {
                newRating.notes = data.notes;
            }
        }

        Beverages.addBeverage(encodeData(newBev))
            .then(function (response) {
                $scope.bev = {};
                if (newRating) {
                    newRating.bev_id = response.data.id;
                    Beverages.addRating(encodeData(newRating))
                        .then(function (response) {
                            console.log('Beverage Added')
                        }, function (error) {
                            console.log(error);
                        });
                }
            }, function (error) {
                console.log(error);
            });
      
    }
})

.controller('BeveragesCtrl', function($scope, Beverages) {

    $scope.status;
    $scope.beverages;

    init();
    function init() {
        $scope.$on('$ionicView.enter', function (e) {
            Beverages.getAllBeverages()
                .then(function (response) {
                    $scope.bev = {};
                    $scope.beverages = response.data;
                }, function (error) {
                    console.log(error);
                });
        });
    }
   
})

.controller('BeverageDetailCtrl', function ($scope, $stateParams, Beverages, LocalStorage, $ionicModal, $ionicPopup, $state) {

    $scope.beverage;
    $scope.average;
    $scope.bevStores;
    $scope.otherStores;

    $scope.price = {};
    $scope.store = {};
    $scope.review = {};


    init();
    function init() {
        $scope.$on('$ionicView.enter', function (e) {
            getBeverage();
            getStores();
        });
    }

    function getBeverage() {
        total = 0;
        count = 0;
        average = 0;
        Beverages.getBeverage($stateParams.beverageId)
            .then(function (response) {
                $scope.beverage = response.data[0];
                count = $scope.beverage.ratings.length;
                for (var i = 0; i < count; i++) {
                    total += $scope.beverage.ratings[i].value;
                }
                $scope.average = total / count;
            }, function (error) {
                console.log(error);
            });
    }


    function getStores() {
        Beverages.getAllStores()
            .then(function (response) {
                var allStores = response.data;
                $scope.bevStores = [];
                $scope.otherStores = [];
                for (var i = 0; i < allStores.length; i++) {
                    var numBevs = allStores[i].prices.length;
                    for (j = 0; j < numBevs; j++) {
                        if (allStores[i].prices[j].beverage == $stateParams.beverageId) {
                            var price = {
                                store: allStores[i],
                                price: allStores[i].prices[j]
                            };
                            $scope.bevStores.push(price);
                            break;
                        }
                    }
                    if (j == numBevs) {
                        $scope.otherStores.push(allStores[i]);
                    }
                }
            }, function (error) {
                console.log(error);
            });
    }

    $scope.addFavorite = function (bev_id) {
        if (!LocalStorage.loggedIn) {
            $ionicPopup.alert({
                title: 'Please Log In',
                template: 'You cannot save favorites until you have logged into your account.'
            });
        }
        else {
            var token = LocalStorage.getToken();
            console.log(token)
            data = {
                'favorite_id': bev_id
            };

            Beverages.addFavorite(encodeURI(token.id_token), encodeData(data))
                .then(function (response) {
                    $scope.result = response;
                    $ionicPopup.alert({
                        title: 'Success',
                        template: 'Added to your favorites!'
                    });
                }, function (error) {
                    console.log(error);
                });
        }
    }

    $ionicModal.fromTemplateUrl('addReview.html', {
        id: '1',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.oModal1 = modal;
    });

    $ionicModal.fromTemplateUrl('addPrice.html', {
        id: '2',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.oModal2 = modal;
    });

    $ionicModal.fromTemplateUrl('addStore.html', {
        id: '3',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.oModal3 = modal;
    });

    $scope.openModal = function (index) {
        if (index == 1) $scope.oModal1.show();
        else if (index == 2) $scope.oModal2.show();
        else {
            $scope.store.country = 'USA';
            $scope.oModal3.show();
        }
    };
    $scope.closeModal = function (index) {
        if (index == 1) {
            $scope.review = {};
            $scope.oModal1.hide();
        }
        else if (index == 2) {
            $scope.price = {};
            $scope.oModal2.hide();
        }
        else {
            $scope.store = {};
            $scope.oModal3.hide();
        }
    };
    $scope.$on('$destroy', function () {
        $scope.oModal1.remove();
        $scope.oModal2.remove();
        $scope.oModal3.remove();
    });

    $scope.AddReview = function (data) {
        var rating = {
            bev_id: parseInt($stateParams.beverageId, 10),
            value: data.rating
        };

        if (data.notes) {
            rating.notes = data.notes;
        }
        
        Beverages.addRating(encodeData(rating))
            .then(function (response) {
                console.log('Added review!');
                getBeverage();
            }, function (error) {
                console.log(error);
            });
        $scope.closeModal(1);
    };

    $scope.AddPrice = function (data) {
        if (data.price && data.date && data.size && data.units && data.store_id) {
            var newPrice = {
                price: data.price,
                day: data.date.getDate(),
                month: data.date.getMonth() + 1,
                year: data.date.getFullYear(),
                size: data.size,
                units: data.units,
                store_id: data.store_id
            };
            newPrice.bev_id = parseInt($stateParams.beverageId, 10);

            Beverages.addPrice(encodeData(newPrice))
                .then(function (response) {
                    console.log('Added Price!');
                    getStores();
                    getBeverage();
                    $scope.price = {};
                }, function (error) {
                    console.log(error);
                });
        }
        $scope.closeModal(2);
    };

    $scope.AddStore = function (data) {
        if (data.name && data.street && data.city && data.state && data.country) {

            Beverages.addStore(encodeData(data))
                .then(function (response) {
                    console.log('Added Store!');
                    getStores();
                    getBeverage();
                    $scope.price = {};
                }, function (error) {
                    console.log(error);
                });
        }
        $scope.closeModal(3);
        $scope.AddPrice();
    };

    $scope.DeleteBeverage = function () {
        Beverages.deleteBeverage(parseInt($stateParams.beverageId, 10))
            .then(function (response) {
                console.log('Beverage Deleted');
                $state.go('tab.beverages');
            }, function (error) {
                console.log(error);
            });
    };

})

.controller('LocationDetailCtrl', function ($scope, $stateParams, Beverages, $ionicModal, $state) {

    $scope.status;
    $scope.beverage;
    $scope.average;
    $scope.bevStores;
    $scope.otherStores;

    $scope.price = {};
    $scope.store = {};
    $scope.review = {};


    init();
    function init() {
        $scope.$on('$ionicView.enter', function (e) {
            getBeverage();
            getStores();
        });
    }

    function getBeverage() {
        total = 0;
        count = 0;
        average = 0;
        Beverages.getBeverage($stateParams.beverageId)
            .then(function (response) {
                $scope.beverage = response.data[0];
                count = $scope.beverage.ratings.length;
                for (var i = 0; i < count; i++) {
                    total += $scope.beverage.ratings[i].value;
                }
                $scope.average = total / count;
            }, function (error) {
                console.log(error);
            });
    }


    function getStores() {
        Beverages.getAllStores()
            .then(function (response) {
                var allStores = response.data;
                $scope.bevStores = [];
                $scope.otherStores = [];
                for (var i = 0; i < allStores.length; i++) {
                    var numBevs = allStores[i].prices.length;
                    for (j = 0; j < numBevs; j++) {
                        if (allStores[i].prices[j].beverage == $stateParams.beverageId) {
                            var price = {
                                store: allStores[i],
                                price: allStores[i].prices[j]
                            };
                            $scope.bevStores.push(price);
                            break;
                        }
                    }
                    if (j == numBevs) {
                        $scope.otherStores.push(allStores[i]);
                    }
                }
            }, function (error) {
                $scope.status = 'Unable to load stores: ' + error.message;
            });
    }

    $ionicModal.fromTemplateUrl('addReviewLocation.html', {
        id: '1',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.oModal1 = modal;
    });

    $ionicModal.fromTemplateUrl('addPriceLocation.html', {
        id: '2',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.oModal2 = modal;
    });

    $ionicModal.fromTemplateUrl('addStoreLocation.html', {
        id: '3',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.oModal3 = modal;
    });

    $scope.openModal = function (index) {
        if (index == 1) $scope.oModal1.show();
        else if (index == 2) $scope.oModal2.show();
        else {
            $scope.store.country = 'USA';
            $scope.oModal3.show();
        }
    };
    $scope.closeModal = function (index) {
        if (index == 1) {
            $scope.review = {};
            $scope.oModal1.hide();
        }
        else if (index == 2) {
            $scope.price = {};
            $scope.oModal2.hide();
        }
        else {
            $scope.store = {};
            $scope.oModal3.hide();
        }
    };
    $scope.$on('$destroy', function () {
        $scope.oModal1.remove();
        $scope.oModal2.remove();
        $scope.oModal3.remove();
    });

    $scope.AddReview = function (data) {
        var rating = {
            bev_id: parseInt($stateParams.beverageId, 10),
            value: data.rating
        };

        if (data.notes) {
            rating.notes = data.notes;
        }

        Beverages.addRating(encodeData(rating))
            .then(function (response) {
                console.log('Added review!');
                getBeverage();
            }, function (error) {
                console.log(error);
            });
        $scope.closeModal(1);
    };

    $scope.AddPrice = function (data) {
        if (data.price && data.date && data.size && data.units && data.store_id) {
            var newPrice = {
                price: data.price,
                day: data.date.getDate(),
                month: data.date.getMonth() + 1,
                year: data.date.getFullYear(),
                size: data.size,
                units: data.units,
                store_id: data.store_id
            };
            newPrice.bev_id = parseInt($stateParams.beverageId, 10);

            Beverages.addPrice(encodeData(newPrice))
                .then(function (response) {
                    console.log('Added Price!');
                    getStores();
                    getBeverage();
                    $scope.price = {};
                }, function (error) {
                    console.log(error);
                });
        }
        $scope.closeModal(2);
    };

    $scope.AddStore = function (data) {
        if (data.name && data.street && data.city && data.state && data.country) {

            Beverages.addStore(encodeData(data))
                .then(function (response) {
                    console.log('Added Store!');
                    getStores();
                    getBeverage();
                    $scope.price = {};
                }, function (error) {
                    console.log(error);
                });
        }
        $scope.closeModal(3);
        $scope.AddPrice();
    };

    $scope.DeleteBeverage = function () {
        Beverages.deleteBeverage(parseInt($stateParams.beverageId, 10))
            .then(function (response) {
                console.log('Beverage Deleted');
                $state.go('tab.location');
            }, function (error) {
                console.log(error);
            });
    };

})


.controller('LocationCtrl', function ($scope, $cordovaGeolocation, $http) {
    init();
    function init() {
        $scope.$on('$ionicView.enter', function (e) {
            if ($scope.city && $scope.state) {
                $scope.stores = getStores($scope.city, $scope.state);
            }
        });
    }
    $scope.getLocation = function () {
        $scope.stores = [];
        var posOptions = { timeout: 10000, enableHighAccuracy: false };
        $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;
                $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + long + '&key=AIzaSyD2QqNMZck66iTtu6lrdTxMmmi5rX6kr_8')
                    .success(function (data, status, headers, config) {
                        for (var i = 0; i < data.results[0].address_components.length; i++) {
                            if (data.results[0].address_components[i].types[0] == "administrative_area_level_1") {
                                $scope.state = data.results[0].address_components[i].short_name;       // STATE
                            }
                            else if (data.results[0].address_components[i].types[0] == "locality") {
                                $scope.city = data.results[0].address_components[i].long_name;        // CITY
                            }

                            else if (data.results[0].address_components[i].types[0] == "country") {
                                $scope.country = data.results[0].address_components[i].short_name;
                            }
                        }

                        $scope.stores = getStores($scope.city, $scope.state);
                        
                    })
                    .error(function (data, status, headers, config) {
                        console.log(status);
                    })

                $scope.lat = lat;
                $scope.long = long;
            }, function (error) {
                console.log(error);
            });
    }

    function getStores(city, state) {
        var storeList = [];
        $http.get('http://bev-api.appspot.com/Store?city=' + encodeURIComponent(city) + '&state=' + encodeURIComponent(state))
            .success(function (data, status, headers, config) {
                for (var i = 0; i < data.length; i++) {
                    storeList.push(getBeverages(data[i]))
                }

            })
            .error(function (data, status, headers, config) {
                console.log(status);
            })
        return storeList;
    }

    function getBeverages(store) {
        var beverages = [];
        for (var j = 0; j < store.prices.length; j++) {
            $http.get('http://bev-api.appspot.com/Beverage?id=' + encodeURIComponent(store.prices[j].beverage))
                .success(function (data, status, headers, config) {
                    beverages.push(data[0]);
                })
                .error(function (data, status, headers, config) {
                    console.log(status);
                })
        }
        var storeInfo = {
            store: store,
            beverages: beverages
        };
        return storeInfo;
    }

});


function encodeData(data) {
    var dataString = [];
    for (var d in data) {
        dataString.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return dataString.join("&");
}