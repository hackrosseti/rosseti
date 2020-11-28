'use strict';

var createProject = angular.module('myApp.project', ['ngRoute']);

createProject.controller('ProjectCtrl', function ($scope, userService, projectService, infoService ) {

    $scope.user = userService.User;
    $scope.selectedPage = 1;
    $scope.project = null;
    tryDigest();
    var projectId = projectService.projectId;
    if(!projectId) userService.redirectTo("kanban");

    getProjectByProjectId();
    function getProjectByProjectId(){
        if(projectId){
            projectService.getProjectByProjectId(projectId).then(function(response){
                if (response && response.project) {
                    $scope.project = response.project;
                    tryDigest();
                } else {
                    infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
                }
            }, function (response) {
                console.log(response);
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            });
        } else{
          console.log("projectId is null")
        }
    }

    $scope.selectedPageF = function(page){
        $scope.selectedPage = page;
        tryDigest();
    }

    function tryDigest() {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }

});