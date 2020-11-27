'use strict';

var loginPage = angular.module('myApp.loginPage', ['ngRoute']);

loginPage.controller('LoginCtrl', function ($scope, userService, $rootScope, infoService, $window) {

    $scope.login = null;
    $scope.password = null;
    $scope.user = {};

    var token = userService.getCookieByName("token");
    if(token){ //if user exits then retry login
        getUserByToken();
    }

    function getUserByToken(){
        if(!userService.User || (userService.User && !userService.User.user_id)) {
            userService.getUserByToken().then(function (response) {
                if (response && response.user) {
                    $scope.user = response.user;
                    userService.User = $scope.user;
                    $rootScope.$broadcast('user:isActive', true);
                    userService.redirectTo("main");
                } else {
                    infoService.infoFunction(response.message, "Ошибка")
                    $scope.user = userService.User = null;
                    $rootScope.$broadcast('user:isActive', true);
                }
            }, function (error) {
                console.log(error)
                $scope.user = userService.User = null;
                $rootScope.$broadcast('user:isActive', true);
            });
        } else {
            $scope.user = userService.User;
            $rootScope.$broadcast('user:isActive', true);
            userService.redirectTo("main");
        }
    }



    $scope.auth = function(){
        if($scope.login && $scope.password){
            userService.login($scope.login, $scope.password).then(function(response){
                if(response && response.token) {
                    var expiration = new Date();
                    expiration = new Date(expiration.setDate(expiration.getDate()+1));
                    userService.setCookie("token", response.token, expiration)
                    $scope.user = response.user;
                    userService.User = $scope.user;
                    $rootScope.$broadcast('user:isActive', true);
                    userService.redirectTo("main");
                } else {
                    infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
                }
            }, function (error) {
                infoService.infoFunction(error.message ? error.message : userService.defaultError, "Ошибка");
                $scope.user = userService.User = null;
            });
            //toMain();
        } else {
            $scope.isLoginError = true;
            setTimeout(function (){
                $scope.isLoginError = false;
                tryDigest();
            }, 1500)
        }
    }

    //проверка ширины экрана
    $scope.width = $window.innerWidth;
    setInterval(function (){
        $scope.width = $window.innerWidth;
        tryDigest();
    },1000);

    /********** FOR TESTING ***********/

    /*$scope.infoModal = function(){
        infoService.infoFunction("тест 12 тест тест", "тест тест")
    }

    $scope.confirm = function(){
        var modalInstanse = infoService.openConfirmationModal("тест 12 тест тест", "тест тест");
    }

    $scope.createUser = function(){
        userService.addUserModal().then(function (){

        })
    }

    $scope.editUser = function (){
        userService.editUserModal($scope.user).then(function (){
        })
    }*/

    function tryDigest() {
        if (!$rootScope.$$phase) {
            $rootScope.$apply();
        }
    }

    /********** FOR TESTING ***********/

});