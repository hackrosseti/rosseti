'use strict';

var createProject = angular.module('myApp.createProject', ['ngRoute']);

createProject.controller('CreateProjectCtrl', function ($scope, userService,  $rootScope, projectService) {

    $scope.projectStatusId = projectService.projectStatusId;
    $scope.user = userService.User;

    $scope.project = {};
    getAllProjectClassificators();
    function getAllProjectClassificators(){
        projectService.getAllProjectClassificators().then(function(response){
            if (response && response.classificators) {
                $scope.projectClassificators = response.classificators;
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

    $scope.addProject = function(project){
        if($scope.project.project_name && $scope.project.project_describe  && $scope.project.project_class
            && $scope.project.author && $scope.project.conference_link && $scope.project.region_id && $scope.project.project_offer && $scope.project.project_profit){
            if(!$scope.project.project_status) $scope.project.project_status = 1;
            if(!$scope.project.conference_link) $scope.project.conference_link = "-";
            if(!$scope.project.region_id) $scope.project.region_id = $scope.user.region_id;
            if(!$scope.project.author) $scope.project.author = $scope.user.user_id;
            $scope.project.project_offer = $scope.project.project_profit = "-";
            projectService.addProject(project).then(function(response){
                if (response && response.projectId) {
                    infoService.infoFunction("Проект успешно создан", "Информация");
                    userService.redirectTo("project");
                } else {
                    infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
                }
            }, function (response) {
                console.log(response)
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            });
        } else {
            infoService.infoFunction("Заполните все поля", "Ошибка");
        }

    }


});