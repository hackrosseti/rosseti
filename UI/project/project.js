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

    $scope.getProjectReport = function(){
        var projectId = $scope.project.project_id;
        if(projectId){
            projectService.getProjectReportByProjectId(projectId).then(function(response){
                if (response && response.result && response.result.data) {
                    var fileName = "template.doc";
                    var save = document.createElement('a');
                    save.target = "_blank";
                    var bytes = new Uint8Array(response.result.data);
                    var file = new File([bytes], fileName , {type:  'application/msword'});
                    save.href = window.URL.createObjectURL(file);
                    save.download = fileName;
                    var event = document.createEvent("MouseEvents");
                    event.initMouseEvent(
                        "click", false, true, window, 0, 0, 0, 0, 0
                        , false, false, false, false, 0, null
                    );
                    save.dispatchEvent(event);

                } else {
                    infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
                }
            }, function (response) {
                console.log(response);
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            });
        } else {
            infoService.infoFunction("Невозможно сформировать отчет. ProjectId не найден", "Ошибка");
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