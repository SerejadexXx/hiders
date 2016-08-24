var module = angular.module('indexApp', []);

module.controller('mainCtrl', function($scope, $http) {
    $scope.Refresh = function() {
        $http.get('/list').then(
            function(response) {
                console.log(response);
                $scope.list = response.data.list;
            },
            function() {
                $scope.list = [];
            }
        );
    };
    $scope.Refresh();
    $scope.toAdd = {

    };
    $scope.Add = function() {
        if (!$scope.toAdd.host || !$scope.toAdd.port) {
            return;
        }
        $scope.toAdd.val = 'ws://' + $scope.toAdd.host + ':' + $scope.toAdd.port;
        $scope.toAdd.amount = 0;

        $scope.list.push(JSON.parse(JSON.stringify($scope.toAdd)));
        $http.post('/update', {list: $scope.list}).then(
            function() {
                $scope.Refresh();
            },
            function() {
                $scope.Refresh();
            }
        );
        $scope.toAdd.host = null;
        $scope.toAdd.port = null;
    };
    $scope.Remove = function(index) {
        $scope.list.splice(index, 1);
        $http.post('/update', {list: $scope.list}).then(
            function() {
                $scope.Refresh();
            },
            function() {
                $scope.Refresh();
            }
        );
    }
});