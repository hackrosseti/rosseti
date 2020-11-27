var services = angular.module('myApp.services', ['ngRoute']);

services.factory('infoService', function ($uibModal, $sce) {
    var service = {};

    service.infoFunction = function (text, title) {
        var modalInstance = $uibModal.open({
            templateUrl: 'modalWindows/InfoModal/infoModal.html',
            controller: 'InfoModalWindowCtrl',
            windowClass: 'info-window-modal',
            size: 'size',
            resolve: {
                element: function () {
                    return text;
                },
                title: function () {
                    return title;
                }
            }
        });
    };

    service.openConfirmationModal = function (title, text) {
        var props = {
            animation: true,
            backdrop: 'static',
            keyboard: false,
            templateUrl: 'modalWindows/ConfirmationModal/confirmationModal.html',
            controller: 'ConfirmationModalCtrl',
            resolve: {
                title: function () {
                    return title;
                },
                text: function () {
                    return text;
                }
            }
        };

        return $uibModal.open(props);
    };

    service.getComment = function (comment) {
        if (comment) {
            comment = $sce.trustAsHtml(findAndReplaceLink(comment.replace(/\r\n|\r|\n/g, " <br /> ")));
            return comment;
        }
    }

    return service;
});

services.factory('datesService', function () {
    var service = {};

    service.getSmallMonth = function (date) {
        switch (date.getMonth()) {
            case 0:
                return "янв";
            case 1:
                return "фев";
            case 2:
                return "мар";
            case 3:
                return "апр";
            case 4:
                return "май";
            case 5:
                return "июн";
            case 6:
                return "июл";
            case 7:
                return "авг";
            case 8:
                return "сен";
            case 9:
                return "окт";
            case 10:
                return "ноя";
            case 11:
                return "дек";
        };
    };

    service.parseDateToStringSmall = function (date) {
        var date = new Date(date);
        var month = date.getMonth() + 1;
        month < 10 ? month = "0" + month : "";
        var day = date.getDate();
        day < 10 ? day = "0" + day : "";
        return day + '.' + month;
    };

    service.parseDateToStringRussian = function (date) {
        var date = new Date(date);
        var month = date.getMonth() + 1;
        month < 10 ? month = "0" + month : "";
        var day = date.getDate();
        day < 10 ? day = "0" + day : "";
        return day + '.' + month + '.' + date.getFullYear();
    };

    service.parseDateToString = function (date) {
        var date = new Date(date);
        var month = date.getMonth() + 1;
        month < 10 ? month = "0" + month : "";
        var day = date.getDate();
        day < 10 ? day = "0" + day : "";
        return date.getFullYear() + '-' + month + '-' + day;
    };

    service.getTimeStringByDate = function (date) {
        if (date) {
            var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
            var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            var seconds = "00";
            return hours + ":" + minutes;
        };
        return null;
    };

    service.isEqualDates = function (date1, date2) {
        if (date1, date2) {
            var d1 = new Date(date1);
            var d2 = new Date(date2);
            if (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate()) {
                return true;
            };
        };
        return false;
    };

    service.isFirstDateBeforeSecondDate = function (date1, date2) {
        if (date1, date2) {
            var d1 = new Date(date1);
            d1.setHours(0);
            d1.setMinutes(0);
            d1.setSeconds(0);
            d1.setMilliseconds(0);
            var d2 = new Date(date2);
            d2.setHours(0);
            d2.setMinutes(0);
            d2.setSeconds(0);
            d2.setMilliseconds(0);
            if (d1.getTime() < d2.getTime()) {
                return true;
            };
        };
        return false;
    };

    service.getDateWithoutTime = function (date) {
        var d = new Date(date);
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
    };

    service.getPrettyRussianDateStringByDate = function (date) {
        switch (date.getMonth()) {
            case 0:
                return date.getDate() + " января " + date.getFullYear();
            case 1:
                return date.getDate() + " февраля " + date.getFullYear();
            case 2:
                return date.getDate() + " марта " + date.getFullYear();
            case 3:
                return date.getDate() + " апреля " + date.getFullYear();
            case 4:
                return date.getDate() + " мая " + date.getFullYear();
            case 5:
                return date.getDate() + " июня " + date.getFullYear();
            case 6:
                return date.getDate() + " июля " + date.getFullYear();
            case 7:
                return date.getDate() + " августа " + date.getFullYear();
            case 8:
                return date.getDate() + " сентября " + date.getFullYear();
            case 9:
                return date.getDate() + " октября " + date.getFullYear();
            case 10:
                return date.getDate() + " ноября " + date.getFullYear();
            case 11:
                return date.getDate() + " декабря " + date.getFullYear();
        };
    };

    return service;
});

services.filter('orderObjectBy', function () {
    return function (items, field, reverse) {
        var filtered = [];
        var nullObjects = [];

        angular.forEach(items, function (item) {
            if (item[field]) filtered.push(item);
            else nullObjects.push(item);
        });

        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });

        if (reverse) filtered.reverse();

        angular.forEach(nullObjects, function (item) {
            filtered.push(item);
        });

        return filtered;
    };
});


services.factory('userService', function ($location, $http, $uibModal, $sce, $q, $rootScope ) {
    var service = {};

    service.User = null;

    service.resolveCheck = function(){
        var defered = $q.defer();
        var token = service.getCookieByName("token");
        if(token){ //if user exits then retry login
            if(!service.User) {
                service.getUserByToken(token).then(function (response) {
                    if (response && response.user) {
                        service.User = response.user;
                        $rootScope.$broadcast('user:isActive', true);
                    } else {
                        service.User = null;
                        service.redirectTo("login");
                        $rootScope.$broadcast('user:isActive', true);
                        console.log(response.message);
                    }
                }, function () {
                    service.User = null;
                    service.redirectTo("login");
                    $rootScope.$broadcast('user:isActive', true);
                });
            }
        } else {
            service.redirectTo("login");
            $rootScope.$broadcast('user:isActive', true);
        }
        tryDigest();
        defered.resolve(true);
        return defered.promise;
    }

    service.redirectTo = function(redirectTo){
        $location.path('/'+redirectTo);
    }

     service.setCookie = function(name,value,expiration){
        var expires = "";
        if (expiration) {
            var date = new Date(expiration);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/ ;"
        //document.cookie = name + "=" + (value || "")  + expires + "; path=/ ;domain=localhost";
    }

    service.getCookieByName  = function (name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
        else return null;
    }

    service.deleteTokenFromCookie  = function(){
        document.cookie = "token=''; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; ";
    }

    function tryDigest() {
        if (!$rootScope.$$phase) {
            $rootScope.$apply();
        }
    }

    /************************************* MODALS *************************************/

    service.addUserModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'modalWindows/addUserModal/addUserModal.html',
            controller: 'AddUserModalCtrl',
            windowClass: 'info-window-modal',
            size: 'size'
        });

        return modalInstance.result;
    };

    service.editUserModal = function (user) {
        var modalInstance = $uibModal.open({
            templateUrl: 'modalWindows/editUserModal/editUserModal.html',
            controller: 'EditUserModalCtrl',
            resolve: {
                user: function () {
                    return user;
                }
            }
        });
        return modalInstance.result;
    };

    /************************************* USER API *************************************/
    service.getAllUsers = function () {
        var deferred = $q.defer();
        $http.get(ipAdress + "/api/user/getAll").success(function (response) {
            deferred.resolve(response);
        }).error(function () {
            deferred.reject('Error in getAllUsers in userService function');
        });
        return deferred.promise;
    }

    service.addUser = function (user) {
        var deferred = $q.defer();
        $http.post(ipAdress + "/api/user/add", user).success(function (response, headers) {
            console.log(headers)
            deferred.resolve(response);
        }).error(function () {
            deferred.reject('Error in addUser in userService function');
        });
        return deferred.promise;
    };

    service.editUser = function (user) {
        var deferred = $q.defer();
        $http.post(ipAdress + "/api/user/edit", user).success(function (response) {
            deferred.resolve(response);
        }).error(function () {
            deferred.reject('Error in editUser in userService function');
        });
        return deferred.promise;
    };

    service.getUserByToken = function () {
        var deferred = $q.defer();
        $http.get(ipAdress + "/api/user/getUserByToken").success(function (response) {
            deferred.resolve(response);
        }).error(function () {
            deferred.reject('Error in getUserByToken in userService function');
        });
        return deferred.promise;
    };

    service.login = function (login, password) {
        var deferred = $q.defer();
        $http.get(ipAdress + "/api/user/login?login="+login+"&password="+password).success(function (response) {
            deferred.resolve(response);
        }).error(function () {
            deferred.reject('Error in login in userService function');
        });
        return deferred.promise;
    };

    /************************************* USER ROLE API *************************************/

    service.getAllUserRoles = function () {
        var deferred = $q.defer();
        $http.get(ipAdress + "/api/user_roles/getAll").success(function (response) {
            deferred.resolve(response);
        }).error(function () {
            deferred.reject('Error in getAllUserRoles in userService function');
        });
        return deferred.promise;
    };

    return service;
});

myApp.factory('userProfile', function ($http, $window, $q) {

    var service = {};

    service.getUserInfo = function (userId) {
        var deferred = $q.defer();
        $http.get(ipAdress + "/userProfile/getUserInfo?userId="+userId ).success(function (response) {
            deferred.resolve(response);
        }).error(function () {
            deferred.reject('Error in getUserInfo in userProfile function');
        });
        return deferred.promise;
    };

    return service;
});


myApp.factory('regionService', function ($http, $window, $q) {

    var service = {};

    service.getAllRegions = function () {
        var deferred = $q.defer();
        $http.get(ipAdress + "/api/region/getAll" ).success(function (response) {
            deferred.resolve(response);
        }).error(function () {
            deferred.reject('Error in getAllRegions in regionService function');
        });
        return deferred.promise;
    };

    return service;
});

myApp.factory('mainService', function ($http, $window, $q) {

    var service = {};

    service.getTestRequest = function (data) {
        var deferred = $q.defer();
        $http.post(ipAdress + "/testPost", data).success(function (response) {
            deferred.resolve(response);
        }).error(function () {
            deferred.reject('Error in getTestRequest in mainService function');
        });
        return deferred.promise;
    };

    return service;
});

function request($http, $q, method, url, func, service, data='') {
    var deferred = $q.defer();
    (data ? $http[method](ipAdress + url, data) : $http[method](ipAdress + url)).success(function (response) {
        deferred.resolve(response);
    }).error(function (error) {
        deferred.reject('Error in ' + func + ' in ' + service + ' function: ' + error);
    });
    return deferred.promise;
}
