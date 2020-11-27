'use strict';

var chat = angular.module('myApp.chat', ['ngRoute']);

chat.controller('ChatCtrl', function ($scope, userService,  $rootScope) {
    $scope.user = userService.User;


});