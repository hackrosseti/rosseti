'use strict';

var createProject = angular.module('myApp.createProject', ['ngRoute']);

createProject.controller('CreateProjectCtrl', function ($scope, userService,  $rootScope, projectService, infoService) {

    $scope.projectStatusId = projectService.projectStatusId;
    if(!$scope.projectStatusId) userService.redirectTo("main");
    $scope.user = userService.User;
    $scope.kanbanStatus = null;

    getAllKanbanStatuses();
    function getAllKanbanStatuses(){
        projectService.getAllKanbanStatuses().then(function(response){
            if (response && response.statuses) {
                $scope.kanbanStatuses = response.statuses;
                $scope.kanbanStatuses.map(function(f){ if($scope.projectStatusId == f.table_id){ $scope.kanbanStatus = f;}})
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

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
        if($scope.project.project_name && $scope.project.project_describe  && $scope.project.project_class && $scope.project.project_offer && $scope.project.project_profit){
            if(!$scope.project.project_status) $scope.project.project_status = 1;
            if(!$scope.project.conference_link) $scope.project.conference_link = "-";
            if(!$scope.project.region_id) $scope.project.region_id = $scope.user.region_id;
            if(!$scope.project.author) $scope.project.author = $scope.user.user_id;
            //$scope.project.project_offer = $scope.project.project_profit = "-";
            projectService.addProject($scope.project).then(function(response){
                if (response && response.projectId) {
                    infoService.infoFunction("Проект успешно создан", "Информация");
                    userService.projectId = response.projectId;
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