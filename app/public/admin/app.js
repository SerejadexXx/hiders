var module = angular.module('indexApp', []);

module.controller('mainCtrl', function($scope, $http) {
    $scope.Refresh = function() {
        $http.get('/addresses/list').then(
            function(response) {
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
        if (toAdd.host == null || toAdd.port == null) {
            return;
        }
        toAdd.val = 'ws://' + toAdd.host + ':' + totAdd.port;
        toAdd.amount = 0;

        $scope.list.push(toAdd);
        $http.post('/addresses/add', {list: $scope.list}).then(
            function() {
                $scope.Refresh();
            },
            function() {
                $scope.Refresh();
            }
        );
    };
});