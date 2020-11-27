'use strict';

var profile = angular.module('myApp.profile', ['ngRoute']);

profile.controller('ProfileCtrl', function ($scope, userService, infoService) {

    if(userService.User){
        $scope.user = userService.User;
    }

    getUserProfileInfo();
    function getUserProfileInfo(){
        if($scope.user.user_id){
            userProfile.getUserInfo($scope.user.user_id).then(function(response){
                if(response && response.userProfile){
                    $scope.userProfile = response.userProfile;
                } else {
                    infoService.infoFunction(response.message, "Ошибка")
                }
            })
        } else {
            console.log("cant get user id");
        }
    }


});