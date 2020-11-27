'use strict';

var kanban = angular.module('myApp.kanban', ['ngRoute']);

kanban.controller('KanbanCtrl', function ($scope, mainService,  $rootScope, infoService, projectService, userService ) {

    $scope.kanbanStatuses = null;
    $scope.projectClassificators = null;
    $scope.projects = null;

    getAllKanbanInfo();
    function getAllKanbanInfo(){
        getAllKanbanStatuses();
        getAllProjects();
        getAllProjectClassificators();
        var infoInterval = setInterval(function (){
            if($scope.kanbanStatuses && $scope.projectClassificators && $scope.projects){
                clearInterval(infoInterval);
                console.log($scope.kanbanStatuses, $scope.projectClassificators, $scope.projects)
                createCanban();
            }
        }, 300)
    }

    var itemsColors = ['text-secondary', 'text-secondary', 'text-info', 'text-dark', 'text-warning', 'text-success', 'text-danger', 'text-success', 'text-danger', 'text-info', 'text-info']
    var borderColors = ['bg-secondary', 'bg-secondary', 'bg-info', 'bg-dark', 'bg-warning', 'bg-success', 'bg-danger', 'bg-success', 'bg-danger', 'bg-info', 'bg-info']

    var boards = [];
    function createCanban(){

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
                console.log(el);
                console.log(boardId);
                // create a form to enter element
                var formItem = document.createElement("form");
                formItem.setAttribute("class", "itemform");
                formItem.innerHTML =
                    '<div class="form-group">' +
                    '<textarea class="form-control" rows="2" autofocus></textarea>' +
                    '</div><div class="form-group">' +
                    '<button type="submit" ng-click="createProject()" class="btn btn-primary btn-xs pull-right p-2">Сохранить</button>' +
                    '<button type="button" ng-click="" id="CancelBtn" class="btn btn-default btn-xs pull-right p-2">Отмена</button></div>';

                KanbanTest.addForm(boardId, formItem);
                formItem.addEventListener("submit", function(e) {
                    e.preventDefault();
                    var text = e.target[0].value;
                    if(text) {
                        KanbanTest.addElement(boardId, {
                            title: text
                        });
                        formItem.parentNode.removeChild(formItem);
                    }
                });
                document.getElementById("CancelBtn").onclick = function() {
                    formItem.parentNode.removeChild(formItem);
                };
            },
            addItemButton: true,
            boards:  boards
        });

    }


    /* var projects = [
         { id:"_text", projectId: 123, title: "Идея у меня есть такая то", click: openProject, drop: changeProjectStatus, class: [itemsColors[0]]},
         { id:"_text", projectId: 1234, title: "Как это сделать? а хз как", click: openProject, drop: changeProjectStatus, class: [itemsColors[1]] }
     ];

     var boards = [
         {
             id: "_problem", title: "Проблема", class: "text-light,pointer,bg-secondary",
             item: [projects[0]]
         }, {
             id: "_idea", title: "Идея проекта", class: "text-light,pointer,bg-info",
             item: [projects[1]]
         }, {
             id: "_hadi", title: "HADI", class: "text-light,pointer,bg-dark",
             item: []
         }, {
             id: "_working", title: "Разработка", class: "text-light,pointer,bg-warning",
             item: []
         }, {
             id: "_in_review", title: "Внедрение", class: "text-light,pointer,bg-danger",
             item: []
         }, {
             id: "_done", title: "Внедрено", class: "text-light,pointer,bg-success",
             item: []
         }
     ];*/

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
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }

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
        console.log(projectId)
        console.log(statusId)
    }

    function getProjectById(projectId){
        console.log(projectId)
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