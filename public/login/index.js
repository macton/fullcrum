var app = angular.module('app', [], function($locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
});

app.controller('main', ['$scope', '$location', function ($scope, $location) {
}]);

