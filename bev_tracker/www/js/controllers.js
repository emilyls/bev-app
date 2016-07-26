angular.module('starter.controllers', [])

.controller('NewCtrl', function ($scope, Beverages, $http) {

    $scope.stores;
    $scope.status;


    $scope.bev = {};

    $scope.AddBeverage = function (data) {
        newBev = {
            bev_name: data.bev_name,
            brand_name: data.brand_name
        };

        if (data.value) {
            newRating = {
                value: data.value
            };
            if (data.notes) {
                newRating.notes = data.notes;
            }
        }

        Beverages.addBeverage(encodeData(newBev))
            .then(function (response) {
                newRating.bev_id = response.data.id;
                $scope.bev = {};
                Beverages.addRating(encodeData(newRating))
                    .then(function (response) {
                        console.log(response);
                    }, function (error) {
                        console.log(error);
                    });
            }, function (error) {
                console.log(error);
                $scope.status = 'Unable to add beverage: ' + error.message;
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
                        $scope.status = 'Unable to load beverages: ' + error.message;
                    });
        });
    }
   
})

.controller('BeverageDetailCtrl', function ($scope, $stateParams, Beverages, $ionicModal, $state) {

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
                $scope.status = 'Unable to load beverage details ' + error.message;
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
                $scope.status = 'Unable to add review: ' + error.message;
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

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});


function encodeData(data) {
    var dataString = [];
    for (var d in data) {
        dataString.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return dataString.join("&");
}