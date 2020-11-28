'use strict';

var users = angular.module('myApp.users', ['ngRoute']);

users.controller('UsersCtrl', function ($scope, userService, infoService, projectService) {

    getAllUsers();

    $scope.countOfIdeas = 0;
    $scope.countOfProblems = 0;
    $scope.countOfDone = 0;


    getAllProjects();
    function getAllProjects(){
        projectService.getAllProjects().then(function(response){
            if (response && response.projects) {
                var countOfIdeas = 0;
                response.projects.map(function(e){if(e.project_status && e.project_status==2) countOfIdeas++});
                $scope.countOfIdeas = countOfIdeas;
                var countOfProblems = 0;
                response.projects.map(function(e){if(e.project_status && e.project_status==1) countOfProblems++});
                $scope.countOfProblems = countOfProblems;
                var countOfDone = 0;
                response.projects.map(function(e){if(e.project_status && e.project_status==7) countOfDone++});
                $scope.countOfDone = countOfDone;
            } else {
                infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
            }
        }, function (response) {
            console.log(response)
            infoService.infoFunction(response.message ? response.message : userService.defaultError, "Ошибка");
        });
    }
    $scope.sortType ='lastname';
    $scope.reverse =true;
    $scope.order = function(reverse, sortType){
        $scope.sortType = sortType;
        $scope.reverse = reverse;
    }

    function getAllUsers() {
        userService.getAllUsers().then(function (response) {
            if(response && response.users){
                $scope.users = response.users;
            } else {
                infoService.infoFunction(response.message, "Ошибка")
            }
        }, function(error) {
            console.error(error);
        });
    }

    $scope.deleteUser = function(user){
        userService.deleteUser({
            'user_id': user.user_id
        }).then(function (result) {
            if (result) {
                getAllUsers();
            };
        }), function(error) {
            console.error('UsersCtrl deleteUser: ', error);
        };
    };

    $scope.editUserModal = function(user){
        userService.editUserModal(user).then(function(result){
            if (result) {
                getAllUsers();
            }
        }, function(error) {
            console.error('UsersCtrl editUserModal: ', error);
        })
    }

    $scope.createUserModal = function(){
        userService.addUserModal().then(function(result) {
            if (result) {
                getAllUsers();
            }
        }, function(error) {
            console.error('UsersCtrl addUserModal: ', error);
        })
    }

});