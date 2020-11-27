
var addUserModal = angular.module('myApp.addUserModalModal', ['ngRoute', 'ui.bootstrap']);

addUserModal.controller('AddUserModalCtrl', function ($scope, $uibModalInstance, userService, infoService, regionService) {

    $scope.newUser = {};

    $scope.addUser = function(){
        $scope.newUser.isAdmin = $scope.newUser.isAdmin === undefined ? false : $scope.newUser.isAdmin;
        userService.addUser($scope.newUser).then(function(result){
            $uibModalInstance.close(result);
        }, function(error) {
            console.error('AddUserModalCtrl: ', error);
        });
    }


    getAllUserRoles();
    getAllRegions();

    function getAllUserRoles(){
        userService.getAllUserRoles().then(function(response){
            if(response && response.users_roles){
                $scope.userRoles = response.users_roles;
            } else {
                setDefaultRoles();
                infoService.infoFunction(response.message, "Ошибка");
            }
        }, function(error) {
            console.error('getAllUserRoles: ', error);
            infoService.infoFunction(error.error, error.message);
            setDefaultRoles();
        });
    }

    function setDefaultRoles(){
        $scope.userRoles = [{userrole_id:1, userrole_name:'Пользователь'}];
        $scope.newUser.role = $scope.userRoles[0];
    }

    function getAllRegions(){
        regionService.getAllRegions().then(function(response){
            if(response && response.regions){
                $scope.regions = response.regions;
            } else {
                setDefaultRegion();
                infoService.infoFunction(response.message, "Ошибка");
            }
        }, function(error) {
            setDefaultRegion();
            infoService.infoFunction(error.error, error.message);
            console.error('getAllRegions: ', error);
        });
    }

    function setDefaultRegion(){
        $scope.regions = [{region_id:0, userrole_name:'Регион не указан'}];
        $scope.newUser.region_id = $scope.regions[0].region_id;
    }

    $scope.close = function () {
        close();
    };

    function  close(){
        $uibModalInstance.close();
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});