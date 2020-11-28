'use strict';

var profile = angular.module('myApp.profile', ['ngRoute']);

profile.controller('ProfileCtrl', function ($scope, userService, infoService, userProfile, regionService) {

    var userInt = setInterval(function(){
        if(userService.User) {
            clearInterval(userInt)
            $scope.user = userService.User;
            getAllRegions();
            console.log($scope.user)
            tryDigest();
        }
    },300)

    function getAllRegions(){
        regionService.getAllRegions().then(function(response){
            if(response && response.regions){
                $scope.regions = response.regions;
                $scope.user.region = $scope.regions[$scope.regions.map(function(e){return e.region_id}).indexOf($scope.user.region_id)]
            } else {
                infoService.infoFunction(response.message, "Ошибка");
            }
        }, function(error) {
            infoService.infoFunction(error.error, error.message);
            console.error('getAllRegions: ', error);
        });
    }

    $scope.savePasswordForUser = function(){
        if($scope.user.password == $scope.user.passwordRepeat) infoService.infoFunction("Пароль обновлен", "Информация");
        else infoService.infoFunction("Пароли не совпадают", "Ошибка");
    }

    $scope.problemsCount = 0;
    $scope.ideasCount = 0;
    $scope.inProjectCount = 0;
    $scope.awards = [];

    getUserProfileInfo();
    function getUserProfileInfo(){
        if($scope.user.user_id){
            userProfile.getUserInfo($scope.user.user_id).then(function(response){
                if(response){
                    $scope.awards = response.awards;
                    $scope.problemsCount = response.likes_amount;
                    $scope.ideasCount = response.own_projects;
                    $scope.inProjectCount  = response.likes_amount+response.own_projects;
                } else {
                    infoService.infoFunction(response.message, "Ошибка")
                }
            })
        } else {
            console.log("cant get user id");
        }
    }

    function tryDigest() {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }

});