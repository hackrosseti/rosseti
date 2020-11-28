'use strict';

var mainPage = angular.module('myApp.mainPage', ['ngRoute']);

mainPage.controller('MainPageCtrl', function ($scope, userService, infoService ,  $rootScope, projectService, likeService) {

    $scope.user = userService.User;
    $scope.project = [];

    getAllProjects();
    function getAllProjects(){
        projectService.getAllProjects().then(function(response){
            if (response && response.projects) {
                $scope.projects = response.projects.slice(0,3);
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

    $scope.redirectToProject = function(projectId){
        if(projectId) {
            projectService.projectId = projectId;
            userService.redirectTo("project");
        } else
            infoService.infoFunction("Невозможно открыть проект: нет id проекта", "Ошибка");
    }

    $scope.like = function(projectId, likeStatusId){
        console.log(projectId, likeStatusId)
        likeService.addLike(projectId, likeStatusId).then(function(response){
            if (response && response.likeId) {
                getAllProjects();
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response);
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

    $scope.dislike = function(projectId, likeStatusId){
        console.log(projectId, likeStatusId)
        likeService.addLike(projectId, likeStatusId).then(function(response){
            if (response && response.likeId) {
                getAllProjects();
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response);
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }


});