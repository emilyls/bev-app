// Beverage Tracker App

angular.module('bev_tracker', ['ionic', 'ngStorage', 'ngCordova', 'ngCordovaOauth', 'ui.router', 'bev_tracker.controllers', 'bev_tracker.services'])


.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  .state('tab.new', {
    url: '/new',
    views: {
      'tab-new': {
        templateUrl: 'templates/tab-new.html',
        controller: 'NewCtrl'
      }
    }
  })
  .state('tab.beverages', {
      url: '/beverages',
      views: {
        'tab-beverages': {
          templateUrl: 'templates/tab-beverages.html',
          controller: 'BeveragesCtrl'
        }
      }
    })
    .state('tab.beverage-detail', {
      url: '/beverages/:beverageId',
      views: {
        'tab-beverages': {
          templateUrl: 'templates/beverage-detail.html',
          controller: 'BeverageDetailCtrl'
        }
      }
    })
  .state('tab.location', {
    url: '/location',
    views: {
      'tab-location': {
        templateUrl: 'templates/tab-location.html',
        controller: 'LocationCtrl'
      }
    }
  })
  .state('tab.location-detail', {
    url: '/location/:beverageId',
    views: {
      'tab-location': {
        templateUrl: 'templates/location-detail.html',
        controller: 'LocationDetailCtrl'
      }
    }
  })
    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    })
    .state('tab.account-detail', {
        url: '/account/:beverageId/:beverageName/:brandName/:userNotes',
        views: {
            'tab-account': {
                templateUrl: 'templates/account-detail.html',
                controller: 'AccountDetailCtrl'
            }
        }
    });

  // default tab
  $urlRouterProvider.otherwise('/tab/beverages');

});
