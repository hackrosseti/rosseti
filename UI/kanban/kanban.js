'use strict';

var kanban = angular.module('myApp.kanban', ['ngRoute']);

kanban.controller('KanbanCtrl', function ($scope, mainService, $window, $rootScope, infoService, userService, projectService ) {

    $scope.user = userService.User;
    $scope.kanbanStatuses = null;
    $scope.projectClassificators = null;
    $scope.projectClassificator = null;
    $scope.projects = null;

    getAllKanbanInfo();
    function getAllKanbanInfo(classificatorId){
        getAllKanbanStatuses();
        getAllProjects(classificatorId);
        getAllProjectClassificators();
        var infoInterval = setInterval(function (){
            if($scope.kanbanStatuses && $scope.projectClassificators && $scope.projects){
                clearInterval(infoInterval);
                console.log($scope.kanbanStatuses, $scope.projectClassificators, $scope.projects)
                createCanban();
            }
        }, 300);
    }

    var itemsColors = ['text-secondary', 'text-secondary', 'text-info', 'text-dark', 'text-warning', 'text-success', 'text-danger', 'text-success', 'text-danger', 'text-info', 'text-info']
    var borderColors = ['bg-secondary', 'bg-info', 'bg-success', 'bg-danger', 'bg-warning', 'bg-success', 'bg-danger', 'bg-success', 'bg-danger', 'bg-info', 'bg-info']

    var boards = [];
    function createCanban(){

        boards = [];
        angular.forEach($scope.kanbanStatuses, function (status, index){
            var projects = [];
            angular.forEach($scope.projects, function (project, index) {
                if(project.project_status == status.table_id) {
                    var project = {
                        id: project.project_id,
                        projectId: project.project_id,
                        title: project.project_name,
                        click: openProject,
                        drop: changeProjectStatus,
                        class: [itemsColors[project.project_status]]
                    };
                    projects.push(project)
                }
            });

            var board = {
                id: status.table_id,
                title: status.status_name,
                class: borderColors[index]+",text-light,pointer",
                item: projects

            };
            boards.push(board);
        })
        setTimeout(function (){
            const myNode = document.getElementById("myKanban");
            myNode.textContent = '';
            var KanbanTest = new jKanban({
                element: "#myKanban",
                gutter: "10px",
                widthBoard: "450px",
                itemHandleOptions:{
                    enabled: true,
                },
                click: function(el) {
                    //console.log("Trigger on all items click!");
                },
                dropEl: function(el, target, source, sibling){
                    //console.log(target.parentElement.getAttribute('data-id'));
                    //console.log(el, target, source, sibling)
                },
                buttonClick: function(el, boardId) {
                    createProjectWithKanbanStatus(boardId);
                },
                addItemButton: true,
                boards:  boards
            });

        },500)


    }

    function createProjectWithKanbanStatus(projectStatusId){
        projectService.projectStatusId = projectStatusId;
        userService.redirectTo("createProject");
    }


    function getAllKanbanStatuses(){
        projectService.getAllKanbanStatuses().then(function(response){
            if (response && response.statuses) {
                $scope.kanbanStatuses = response.statuses;
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }


    function getAllProjectClassificators(){
        projectService.getAllProjectClassificators().then(function(response){
            if (response && response.classificators) {
                $scope.projectClassificators = response.classificators;
                tryDigest();
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

    function tryDigest() {
        if (!$rootScope.$$phase) {
            $rootScope.$apply();
        }
    }

    function getAllProjects(classificatorId){
        if(!classificatorId){

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
        } else {

            console.log("Get project by classificatorId:"+classificatorId)
            $scope.projects = [];
            projectService.getProjectsByClassificator(classificatorId).then(function(response){
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

    }

    var openProject = function(el){
       if($(el)[0].getAttribute("data-projectid")) {
           getProjectById($(el)[0].getAttribute("data-projectid"));
       } else
           infoService.infoFunction("Невозможно открыть проект: нет id проекта", "Ошибка");
    }

    var changeProjectStatus = function(el, target){
        if($(el)[0].getAttribute("data-projectid")) {
            if(target.parentElement.getAttribute('data-id')){
                changeStatusForProject($(el)[0].getAttribute("data-projectid"), target.parentElement.getAttribute('data-id'));
            } else {
                infoService.infoFunction("Невозможно сохранить проект: нет border id", "Ошибка");
            }
        } else
            infoService.infoFunction("Невозможно сохранить проект: нет id проекта", "Ошибка");
    }

    function changeStatusForProject(projectId, statusId){
        projectService.updateProjectStatus(projectId, statusId).then(function(response){
            if (response) {
                getAllKanbanInfo($scope.projectClassificator);
                tryDigest();
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
        console.log(projectId)
        console.log(statusId)
    }

    function getProjectById(projectId){
        //console.log(projectId)
        projectService.projectId = projectId;
        userService.redirectTo("project");
    }

    $scope.getAllProjectsWithClassif = function(classifId){
        $scope.projectClassificator = classifId;
        getAllKanbanInfo(classifId);
    }

   /* var toDoButton = document.getElementById("addToDo");
    toDoButton.addEventListener("click", function() {
        KanbanTest.addElement("_todo", {
            title: "Test Add"
        });
    });

    var addBoardDefault = document.getElementById("addDefault");
    addBoardDefault.addEventListener("click", function() {
        KanbanTest.addBoards([
            {
                id: "_default",
                title: "Kanban Default",
                item: [
                    {
                        title: "Default Item"
                    },
                    {
                        title: "Default Item 2"
                    },
                    {
                        title: "Default Item 3"
                    }
                ]
            }
        ]);
    });

    var removeBoard = document.getElementById("removeBoard");
    removeBoard.addEventListener("click", function() {
        KanbanTest.removeBoard("_done");
    });

    var removeElement = document.getElementById("removeElement");
    removeElement.addEventListener("click", function() {
        KanbanTest.removeElement("_test_delete");
    });

    var allEle = KanbanTest.getBoardElements("_todo");
    allEle.forEach(function(item, index) {
        //console.log(item);
    });*/
});