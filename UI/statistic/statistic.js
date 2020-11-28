'use strict';

var statistic = angular.module('myApp.statistic', ['ngRoute']);

statistic.controller('StatisticCtrl', function ($scope, userService, infoService ,  $rootScope, projectService) {

    $scope.user = userService.User;
    $scope.projects = [];
    $scope.projectsAll = [];

    getAllKanbanStatuses();

    function getDashBoardStats(){
        projectService.getDashBoardStats().then(function(response){
            if (response && response.projects) {
                $scope.projectsAll = response.projects;
                $scope.projects = response.projects;
                createChart();
                /* $scope.projects = response.projects.sort(function (a, b) {if (a.project_id < b.project_id) {return 1;}if (a.project_id > b.project_id) {return -1;}return 0;}).slice(0,3);
                 $scope.allProjects = response.projects.sort(function (a, b) {if (a.project_id < b.project_id) {return 1;}if (a.project_id > b.project_id) {return -1;}return 0;});*/
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

    function getAllKanbanStatuses(){
        projectService.getAllKanbanStatuses().then(function(response){
            if (response && response.statuses) {
                $scope.kanbanStatuses = response.statuses;
                getDashBoardStats();
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

    function tryDigest() {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }

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

    $scope.selectProjectWithClassificator = function (classificatorId){
        if(classificatorId && classificatorId!=1){
            projectService.getClassificators(classificatorId).then(function(response){
                if (response && response.classificators) {
                    $scope.projects = $scope.projectsAll.filter(function(e){return response.classificators.includes(e.project_class)});
                }
            });

        } else {
            $scope.projects = $scope.projectsAll;
        }
        createChart();
    }

    $scope.fromStart = true;
    $scope.startStage = false;

    $scope.checkRadio = function(){
        createChart();
    }
    var myBar = null;
    var static24HoursValue = 24 * 60 * 60 * 1000;
    function createChart( ){
        var existProjectStatus = $scope.projects.map(function(e){ return e.project_status });
        existProjectStatus = existProjectStatus.filter(onlyUnique);
        var today = new Date();
        var data = [];
        if($scope.fromStart) {
            //от начала проекта
            data = existProjectStatus.map(function(j){
                var data = $scope.projects.map(function(e){ if(e.project_status == j) {
                    return (today.getTime() - new Date(e.start_date).getTime()) / static24HoursValue}
                });
                return data;
            });
        }
        if($scope.startStage) {
            //от начала статуса проекта
            data = existProjectStatus.map(function(j){
                var data = $scope.projects.map(function(e){ if(e.project_status == j) {
                    return (today.getTime() - new Date(e.last_date).getTime()) / static24HoursValue}
                });
                return data;
            });
        }
        //data.map(function(e){Number(e).toFixed(2)})
        console.log(data)
        var boxplotData = {
            // define label tree
            labels: $scope.kanbanStatuses.filter(function(e){return existProjectStatus.includes(e.table_id)}).map(function(e) {return e.status_name}),
            datasets: [{
                label: 'Время',
                backgroundColor: 'rgba(255,0,0,0.5)',
                borderColor: 'blue',
                borderWidth: 1,
                outlierColor: '#999999',
                padding: 10,
                itemRadius: 0,
                data: data
            }]
        };

        if(myBar!=null) myBar.destroy();
        var ctx = document.getElementById("canvas").getContext("2d");
        myBar = new Chart(ctx, {
            type: 'boxplot',
            data: boxplotData,
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Стадии проекта по времени'
                }
            }
        });


    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

});