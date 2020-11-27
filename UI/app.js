'use strict';
var ipAdress;
// FOR LOCAL
var serverUrlIndex = 0;

setIpAddress();

function setIpAddress() {
    if (serverUrlIndex == 0) ipAdress = "http://168.63.58.52:8080";
    //local
    if (serverUrlIndex == 1) ipAdress = "http://127.0.0.1:8080";
};

var myApp = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ui.select', 'myApp.services', 'myApp.confirmationModal','myApp.loginPage',
        'myApp.infoModal',  'myApp.mainPage', 'myApp.users', 'myApp.addUserModalModal', 'myApp.editUserModalModal', 'myApp.profile', 'myApp.settings',
        'myApp.chat', 'myApp.kanban']);


myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});

myApp.factory('authInterceptor', function ($rootScope, $q) {

    var service = {};

    service.request = function (config) {
        config.headers = config.headers || {};

        if(getCookieByName("token") != undefined) config.headers.Authorization = getCookieByName("token");
        return config;
    };

    return service;
});

function getCookieByName(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
    else return null;
}

myApp.config(function ($routeProvider) {


    var UserResolve = {
        authorizeCheck: function(userService) {
            return userService.resolveCheck();
        }
    };

    $routeProvider
        .otherwise({
            redirectTo: '/notFound404'
        })
        .when('/', {
            redirectTo: '/main'
        })
        .when('/main', {
            templateUrl: 'mainPage/mainPage.html',
            controller: 'MainPageCtrl',
            resolve: UserResolve
        })
        .when('/notFound404', {
            templateUrl: 'notFound404/404.html',
        })
        .when('/chat', {
            templateUrl: 'chat/chat.html',
            controller: 'ChatCtrl',
            resolve: UserResolve
        })
        .when('/settings', {
            templateUrl: 'settings/settings.html',
            controller: 'SettingsCtrl',
            resolve: UserResolve
        })
        .when('/kanban', {
            templateUrl: 'kanban/kanban.html',
            controller: 'KanbanCtrl',
            resolve: UserResolve
        })
        .when('/users', {
            templateUrl: 'users/users.html',
            controller: 'UsersCtrl',
            resolve: UserResolve
        })
        .when('/login', {
            templateUrl: 'loginPage/loginPage.html',
            controller: 'LoginCtrl',
        })
        .when('/profile', {
            templateUrl: 'profile/profile.html',
            controller: 'ProfileCtrl',
            resolve: UserResolve
        })

});

myApp.controller('UserCtrl', function ($scope, $rootScope, userService) { //это контроллер , он ставится в шаблоне html ng-controller="UserCtrl" - и отвечает за видимость внутри вложенных dom элементов старницы
    $scope.isToggled = true;

    if(userService.User){
        $scope.user = userService.User;
    }

    tryDigest();
    $scope.$on('user:isActive', function() {
        if(userService.User){
            $scope.user = userService.User;
        }
        tryDigest();
    });

    $scope.openDD = function (selectedTab) {
        $('#' + selectedTab + 'Li .dropdown-menu').css({
            'display': 'unset'
        });
        $('#' + selectedTab + 'Li .dropdown-menu').show(0);
        $('.dropdown:hover .dropdown-menu').slideDown(0);
    };
    function tryDigest() {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }
    $scope.closeDropDown = function () {
        $('.dropdown-menu').slideUp(0);
    }
    $scope.logOut = function(){
        userService.deleteTokenFromCookie();
        $scope.user = $rootScope.user = null;
        userService.redirectTo("login")
        tryDigest();
    };

    $scope.setSelectedTabInTab = function (value) {
        $scope.selectedTabInTab = value;
        $scope.openDropDowns = false;
        $('.dropdown-menu').stop().slideUp(0);
        closeNavButton();
    };

    $scope.closeNavButton = function () {
        closeNavButton();
    };

    function closeNavButton() {
        var navButton = $('#navButton');
        if (navButton && navButton[0] && navButton[0].offsetParent) {
            $('#navButton').click();
        };
    };

    $scope.getCurrentYear = function () {
        return new Date().getFullYear();
    }

});

myApp.filter('notNull', function () {
    return function (input) {
        if (input && input.search('null') != -1) {
            input = input.replace('null', '');
        }
        return input;
    }
});