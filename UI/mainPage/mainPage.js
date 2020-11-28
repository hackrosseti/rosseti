'use strict';

var mainPage = angular.module('myApp.mainPage', ['ngRoute']);

mainPage.controller('MainPageCtrl', function ($scope, userService, mainService,  $rootScope, projectService ) {

    $scope.user = userService.User;
    $scope.project = [];

    getAllProjects();
    function getAllProjects(){
        projectService.getAllProjects().then(function(response){
            if (response && response.projects) {
                $scope.projects = response.projects;
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

});