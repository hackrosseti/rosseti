'use strict';

var users = angular.module('myApp.users', ['ngRoute']);

users.controller('UsersCtrl', function ($scope, userService, infoService) {

    getAllUsers();

    $scope.countOfIdeas = 1;
    $scope.countOfProblems = 2;
    $scope.countOfDone = 3;

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