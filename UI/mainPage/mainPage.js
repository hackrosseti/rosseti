'use strict';

var mainPage = angular.module('myApp.mainPage', ['ngRoute']);

mainPage.controller('MainPageCtrl', function ($scope, userService, mainService,  $rootScope) {

    $scope.user = userService.User;

});