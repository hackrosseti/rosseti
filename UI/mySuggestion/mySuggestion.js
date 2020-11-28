'use strict';

var mySuggestion = angular.module('myApp.mySuggestion', ['ngRoute']);

mySuggestion.controller('MySuggestionCtrl', function ($scope, projectService, infoService, userService, likeService) {

    $scope.myIdeas = [];
    $scope.user = userService.User;

    getAllProjects();
    function getAllProjects(){
        projectService.getAllProjects().then(function(response){
            if (response && response.projects) {

                $scope.myIdeas = response.projects.filter(function(e){return e.author == $scope.user.user_id});
                $scope.myIdeasShort = $scope.myIdeas.slice(0,3)
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
            console.log(response)
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
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

});