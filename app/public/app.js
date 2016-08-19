var module = angular.module('indexApp', []);

module.filter('formatSeconds', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);

module.service('segmentsFunctional', function() {
    var segments = [];
    this.Set = function(_segments) {
        segments = _segments;
    };
    this.BuildChain = function(x, y, r) {
        var dist = function(x, y, x1, y1) {
            return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
        };
        var points = [];
        for (var sAngle = 0; sAngle <= Math.PI * 2; sAngle += Math.PI * 2 / 360) {
            var angle = sAngle + 0.001;
            var x1 = x + Math.cos(angle) * r;
            var y1 = y + Math.sin(angle) * r;
            var a = y1 - y;
            var b = x - x1;
            var c = - (a * x + b * y);

            segments.forEach(function(segment) {
                if (segment.p1.x == segment.p2.x) {
                    var iX = segment.p1.x;
                    var iY = -(a * iX + c) / b;
                    if (Math.abs(dist(x, y, x1, y1) - dist(x, y, iX, iY) - dist(x1, y1, iX, iY)) < 0.0000001) {
                        if (Math.abs(dist(segment.p1.x, segment.p1.y, iX, iY) +
                                dist(iX, iY, segment.p2.x, segment.p2.y) -
                                dist(segment.p1.x, segment.p1.y, segment.p2.x, segment.p2.y)) < 0.000001) {
                            x1 = iX;
                            y1 = iY;
                        }
                    }
                } else {
                    var iY = segment.p1.y;
                    var iX = -(b * iY + c) / a;
                    if (Math.abs(dist(x, y, x1, y1) - dist(x, y, iX, iY) - dist(x1, y1, iX, iY)) < 0.0000001) {
                        if (Math.abs(dist(segment.p1.x, segment.p1.y, iX, iY) +
                            dist(iX, iY, segment.p2.x, segment.p2.y) -
                            dist(segment.p1.x, segment.p1.y, segment.p2.x, segment.p2.y)) < 0.000001) {
                            x1 = iX;
                            y1 = iY;
                        }
                    }
                }
            });
            points.push({
                x: x1,
                y: y1
            });
        }
        return points;
    };

});

module.controller('mainCtrl', function(
    $scope,
    segmentsFunctional,
    $http,
    $timeout
) {
    var mainInterval;
    var keydownEventListener;
    var mousedownEventListener;
    var mouseoutEventListener;
    var mouseupEventListener;
    var mousemoveEventListener;
    $scope.viewState = 'list';
    $scope.serverError = null;
    var processing = false;
    $scope.EnterRoom = function() {
        if (!processing) {
            $scope.serverError = null;
            processing = true;
            $http.get('/rooms/free', {}).then(
                function(response) {
                    processing = false;
                    $scope.viewState = 'room';
                    startGame(response.data.address, $scope.enteredName.val || "Anonymous");
                },
                function(response) {
                    processing = false;
                    if (response.status == 503) {
                        $scope.serverError = 'No room is available :( Try later';
                    }
                }
            );
        }
    };
    $scope.enteredName = {
        val: ""
    };


    // room viewState
    var kickTimeout = null;
    var startGame = function(address, userName) {
        $scope.shouldSelect = true;
        $scope.playerTeams = [
            {
                key: 0,
                disp: 'Scissors',
                color: 'rgb(13, 93, 253)',
                src: '/assets/scissors'
            },
            {
                key: 1,
                disp: 'Rocks',
                color: 'rgb(93, 253, 13)',
                src: '/assets/rocks'
            },
            {
                key: 2,
                disp: 'Papers',
                color: 'rgb(253, 13, 93)',
                src: '/assets/papers'
            }
        ];
        $scope.playerTypeObj = null;
        $scope.playerTeam = null;
        $scope.playerTeamObj = null;
        $scope.playerTypes = [
            {
                key: 0,
                disp: 'Rayer',
                color: 'rgb(0, 200, 0)',
                src: '_rayer.png',
                bonus: 'Free x-Ray!'
            },
            {
                key: 1,
                disp: 'Bomber',
                color: 'rgb(0, 191, 255)',
                src: '_bomber.png',
                bonus: 'Free shots!'
            },
            {
                key: 2,
                disp: 'Hider',
                color: 'rgb(10, 11, 34)',
                src: '_hider.png',
                bonus: 'Hides from x-Ray!'
            },
            {
                key: 3,
                disp: 'Booster',
                color: 'rgb(255,127,80)',
                src: '_booster.png',
                bonus: 'More boost!'
            },
            {
                key: 4,
                disp: 'Faster',
                color: 'rgb(255,255,51)',
                src: '_faster.png',
                bonus: 'Just faster!'
            }
        ];
        var ImageList = [];
        $scope.playerTeams.forEach(function (team) {
            var ImagePlayerTypesList = [];
            $scope.playerTypes.forEach(function (playerType) {
                var newImage = new Image();
                newImage.src = team.src + playerType.src;

                ImagePlayerTypesList.push(newImage);
            });
            ImageList.push(ImagePlayerTypesList);
        });
        $scope.topScores = [];
        $scope.selectedPlayerType = null;
        $scope.curBoost = 0;
        $scope.maxBoost = 1;
        $scope.percentBoost = 0;
        $scope.SelectPlayerType = function (key) {
            $scope.selectedPlayerType = key;
        };
        $scope.teamsInfo = [{
            size: 0,
            src: '/assets/scissors_ico.png',
            color: $scope.playerTeams[0].color,
            disp: $scope.playerTeams[0].disp
        }, {
            size: 0,
            src: '/assets/rocks_ico.png',
            color: $scope.playerTeams[1].color,
            disp: $scope.playerTeams[1].disp
        }, {
            size: 0,
            src: '/assets/papers_ico.png',
            color: $scope.playerTeams[2].color,
            disp: $scope.playerTeams[2].disp
        }];
        var UpdateTeamsSizes = function (usersList) {
            $scope.teamsInfo[0].size = 0;
            $scope.teamsInfo[1].size = 0;
            $scope.teamsInfo[2].size = 0;
            usersList.forEach(function (user) {
                if (user.playerType == null) {
                    return;
                }
                $scope.teamsInfo[user.team].size++;
            });
        };

        $scope.gameState = {
            val: 'choosePlayer',
            timeRemaining: 0
        };
        $scope.winnerState = {
            val: 'off'
        };


        var canvas = document.getElementById('mainCanvas');
        var visibleWidth = Math.min(
            Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            canvas.width
        );
        var visibleHeight = Math.min(
            Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
            canvas.height
        );
        var ctx = canvas.getContext('2d');
        var socket = io.connect(address, {
            reconnection: false
        });
        socket.on('connect', function () {
            socket.emit('data', {
                userName: userName,
                userId: 'id_' + Math.round(Math.random() * 1000000000)
            });
        });
        socket.on('disconnect', function() {
            if(!$scope.$$phase) {
                $scope.viewState = 'list';
            } else {
                $scope.$apply(function () {
                    $scope.viewState = 'list';
                });
            }
        });
        $scope.LeaveRoom = function() {
            socket.disconnect();
           // $scope.viewState = 'list';
        };
        $scope.PlayerTypeSelected = function () {
            socket.emit('playerType', {
                playerType: $scope.selectedPlayerType
            });
            $scope.gameState.val = 'waiting';
            $scope.selectedPlayerType = null;
            $scope.shouldSelect = false;
        };
        var CalcTotalScore = function (user) {
            return user.scorePlus - user.scoreMinus;
        };
        var user = null;
        var closePlayersList = [];
        var farPlayersList = [];
        var usersInfoList = [];
        var speedUpOn = false;
        var xRayOn = false;
        var boostSize = 1;
        var maxBoost = 1;
        var segments = [];
        var myGroupId = null;
        var activeShots = [];
        socket.on('infoUpdate', function (data) {
            if (data.team != null) {
                user = null;
                myGroupId = null;
                usersInfoList = [];
                closePlayersList = [];
                farPlayersList = [];
                activeShots = [];

                $scope.$apply(function () {
                    $scope.playerTeam = data.team;
                    $scope.playerTeamObj = $scope.playerTeams.filter(function (team) {
                        return team.key == $scope.playerTeam;
                    })[0];
                    $scope.gameState.val = data.gameState.val;
                    if ($scope.gameState.val == 'choosePlayer') {
                        $scope.kickInSec = 15;

                        $timeout.cancel(kickTimeout);
                        var kickTimeoutFunc = function () {
                            $scope.kickInSec--;
                            if ($scope.kickInSec > 0) {
                                kickTimeout = $timeout(kickTimeoutFunc, 1000);
                            }
                        };
                        //console.log($scope.kickInSec);
                        kickTimeout = $timeout(kickTimeoutFunc, 1000);
                    }

                    $scope.shouldSelect = true;
                    $scope.selectedPlayerType = null;
                    $scope.playerTypeObj = null;
                });
            }
            if (data.user != null) {
                user = data.user;
                myGroupId = user.groupId;
                $scope.$apply(function () {
                    $scope.curBoost = user.boostSize;
                    $scope.maxBoost = user.maxBoost;
                    $scope.percentBoost = Math.round($scope.curBoost / $scope.maxBoost * 100);
                    $scope.playerTypeObj = $scope.playerTypes.filter(function (type) {
                        return type.key == user.playerType
                    })[0];
                });
                lastUpdateTime = Date.now();
            }
            if (user == null) {
                return;
            }

            if (data.gameState) {
                //console.log(data.gameState.val);
                if (data.gameState.val) {
                    $scope.$apply(function () {
                        $scope.gameState.val = data.gameState.val;
                    });
                }
                if (data.gameState.timeRemaining) {
                    $scope.$apply(function () {
                        $scope.gameState.timeRemaining = data.gameState.timeRemaining;
                    });
                }
            }

            if (data.segments != null) {
                segments = data.segments;
                segmentsFunctional.Set(segments);
            }
            if (data.usersInfoList != null) {
                usersInfoList = data.usersInfoList;
                $scope.$apply(function () {
                    UpdateTeamsSizes(usersInfoList);
                    $scope.topScores = usersInfoList.map(function (userInfo) {
                        return {
                            name: userInfo.name,
                            totalScore: CalcTotalScore(userInfo),
                            scorePlus: userInfo.scorePlus,
                            scoreMinus: userInfo.scoreMinus,
                            groupId: userInfo.groupId,
                            isCurrentPlayer: userInfo.groupId == user.groupId
                        };
                    }).sort(function (a, b) {
                        if (a.totalScore != b.totalScore) {
                            return b.totalScore - a.totalScore;
                        }
                        return b.scorePlus - a.scorePlus
                    });
                });
            }

            if (data.closePlayersList != null) {
                closePlayersList = data.closePlayersList;
            }

            if (data.farPlayersList != null) {
                farPlayersList = data.farPlayersList;
            }

            if (data.shotPosition != null) {
                activeShots.push({
                    x: data.shotPosition.x,
                    y: data.shotPosition.y,
                    r: data.shotPosition.r
                });
            }

            if (data.winnerTeam != null) {
                $scope.$apply(function () {
                    $scope.winnerState.val = 'on';
                    $scope.winnerState.winnerTeam = data.winnerTeam;
                    //console.log($scope.winnerTeam);
                    $scope.winnerState.srcPref = $scope.playerTeams.filter(function (team) {
                        return team.key == $scope.winnerState.winnerTeam;
                    })[0].src;
                    //console.log($scope.srcPref);
                    if (user.team == data.winnerTeam) {
                        $scope.winnerState.text = 'Your team wins!';
                        $scope.winnerState.color = '#00c800';
                    } else {
                        $scope.winnerState.text = 'Your team lost!';
                        $scope.winnerState.color = '#ff3333';
                    }
                    $scope.winnerState.img = [{
                        src: '_faster.png',
                        top: 100,
                        left: 100,
                        width: 100,
                        height: 100
                    }, {
                        src: '_bomber.png',
                        top: 190,
                        left: 190,
                        width: 120,
                        height: 120
                    }, {
                        src: '_booster.png',
                        top: 80,
                        left: 290,
                        width: 140,
                        height: 140
                    }, {
                        src: '_hider.png',
                        top: 190,
                        left: 390,
                        width: 140,
                        height: 140
                    }, {
                        src: '_rayer.png',
                        top: 90,
                        left: 490,
                        width: 130,
                        height: 130
                    }, {
                        src: '_faster.png',
                        top: 200,
                        left: 600,
                        width: 150,
                        height: 150
                    }, {
                        src: '_hider.png',
                        top: 100,
                        left: 680,
                        width: 90,
                        height: 90
                    }, {
                        src: '_bomber.png',
                        top: 150,
                        left: 770,
                        width: 100,
                        height: 100
                    }, {
                        src: '_booster.png',
                        top: 260,
                        left: 810,
                        width: 80,
                        height: 80
                    }];
                });
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.winnerState.val = 'off';
                    });
                }, 2000);
            }

        });

        var drawPlayer = function (x, y, r, team, playerType, name) {
            if (team == 0) {
                ctx.strokeStyle = 'rgb(13, 93, 253)';
            } else if (team == 1) {
                ctx.strokeStyle = 'rgb(93, 253, 13)';
            } else {
                ctx.strokeStyle = 'rgb(253, 13, 93)';
            }
            ctx.lineWidth = 3;

            ctx.save();
            ctx.beginPath();

            ctx.moveTo(x - user.x + visibleWidth / 2 + r, y - user.y + visibleHeight / 2);
            ctx.arc(x - user.x + visibleWidth / 2, y - user.y + visibleHeight / 2, r, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(ImageList[team][playerType], x - user.x + visibleWidth / 2 - r, y - user.y + visibleHeight / 2 - r, 2 * r, 2 * r);
            ctx.restore();

            ctx.beginPath();
            ctx.moveTo(x - user.x + visibleWidth / 2 + r, y - user.y + visibleHeight / 2);
            ctx.arc(x - user.x + visibleWidth / 2, y - user.y + visibleHeight / 2, r, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.font = "18px Raleway";
            ctx.lineWidth = 1;
            ctx.textAlign = "center";
            ctx.strokeText(name, x - user.x + visibleWidth / 2, y - user.y + visibleHeight / 2 + r + 20, 200);
        };

        var drawFarPlayer = function (angle, team, name) {
            if (team == 0) {
                ctx.strokeStyle = 'rgb(13, 93, 253)';
            } else if (team == 1) {
                ctx.strokeStyle = 'rgb(93, 253, 13)';
            } else {
                ctx.strokeStyle = 'rgb(253, 13, 93)';
            }
            angle = angle / 180 * Math.PI;
            var x = visibleWidth / 2;
            var y = visibleHeight / 2;
            for (var dist = 2000; dist > 1; dist /= 2) {
                var nx = x + dist * Math.cos(angle);
                var ny = y + dist * Math.sin(angle);
                if (nx > 60 && nx < visibleWidth - 250 && ny > 30 && ny < visibleHeight - 60) {
                    x = nx;
                    y = ny;
                }
            }
            ctx.font = "18px Raleway";
            ctx.lineWidth = 1;
            ctx.textAlign = "center";
            ctx.strokeText(name, x, y, 200);
        };

        clearInterval(mainInterval);
        var lastUpdateTime = Date.now();
        mainInterval = setInterval(function () {
            visibleWidth = Math.min(
                Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                canvas.width
            );
            visibleHeight = Math.min(
                Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                canvas.height
            );
            ctx.clearRect(0, 0, visibleWidth + 50, visibleHeight + 50);

            var visible = [];
            if ($scope.gameState.val == 'game') {
                if (xRayOn) {
                    ctx.globalCompositeOperation = 'hue';
                    ctx.fillStyle = 'rgba(0, 255, 0, ' + Math.random() + ')';
                    ctx.fillRect(0, 0, visibleWidth, visibleHeight);
                } else {
                    var hull = segmentsFunctional.BuildChain(user.x, user.y, user.visionSize);
                    //console.log(hull);
                    var grd = ctx.createRadialGradient(
                        visibleWidth / 2, visibleHeight / 2, 0,
                        visibleWidth / 2, visibleHeight / 2, user.visionSize
                    );
                    grd.addColorStop(0, 'rgba(0, 255, 0, ' + (Math.random() / 50 + 1 / 8) + ')');
                    grd.addColorStop(1, "white");

                    ctx.beginPath();
                    ctx.fillStyle = grd;
                    ctx.moveTo(Math.round(hull[0].x + visibleWidth / 2 - user.x), Math.round(hull[0].y + visibleHeight / 2 - user.y));
                    for (var i = 1; i < hull.length; i++) {
                        ctx.lineTo(Math.round(hull[i].x + visibleWidth / 2 - user.x), Math.round(hull[i].y + visibleHeight / 2 - user.y));
                    }
                    ctx.fill();
                }


                ctx.beginPath();
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                segments.forEach(function (segment) {
                    ctx.moveTo(segment.p1.x - user.x + visibleWidth / 2, segment.p1.y - user.y + visibleHeight / 2);
                    ctx.lineTo(segment.p2.x - user.x + visibleWidth / 2, segment.p2.y - user.y + visibleHeight / 2);
                });
                ctx.stroke();

                ctx.beginPath();
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = 'black';
                ctx.setLineDash([1, 6]);
                ctx.lineWidth = 1;
                segments.forEach(function (segment) {
                    ctx.moveTo(segment.p1.x - user.x + visibleWidth / 2, segment.p1.y - user.y + visibleHeight / 2);
                    ctx.lineTo(segment.p2.x - user.x + visibleWidth / 2, segment.p2.y - user.y + visibleHeight / 2);
                    if (segment.p1.x == segment.p2.x) {
                        ctx.moveTo(segment.p1.x - 3 - user.x + visibleWidth / 2, segment.p1.y - user.y + visibleHeight / 2);
                        ctx.lineTo(segment.p2.x - 3 - user.x + visibleWidth / 2, segment.p2.y - user.y + visibleHeight / 2);
                        ctx.moveTo(segment.p1.x + 4 - user.x + visibleWidth / 2, segment.p1.y - user.y + visibleHeight / 2);
                        ctx.lineTo(segment.p2.x + 4 - user.x + visibleWidth / 2, segment.p2.y - user.y + visibleHeight / 2);
                    } else {
                        ctx.moveTo(segment.p1.x - user.x + visibleWidth / 2, segment.p1.y - 3 - user.y + visibleHeight / 2);
                        ctx.lineTo(segment.p2.x - user.x + visibleWidth / 2, segment.p2.y - 3 - user.y + visibleHeight / 2);
                        ctx.moveTo(segment.p1.x - user.x + visibleWidth / 2, segment.p1.y + 4 - user.y + visibleHeight / 2);
                        ctx.lineTo(segment.p2.x - user.x + visibleWidth / 2, segment.p2.y + 4 - user.y + visibleHeight / 2);
                    }
                });
                ctx.stroke();
                ctx.lineWidth = 2;
                ctx.setLineDash([]);


                closePlayersList.forEach(function (player) {
                    var closeUser = usersInfoList.filter(function (user) {
                        return user.groupId == player.groupId;
                    })[0];
                    if (closeUser) {
                        drawPlayer(
                            player.x,
                            player.y,
                            closeUser.radius,
                            closeUser.team,
                            closeUser.playerType,
                            closeUser.name + " (" + CalcTotalScore(closeUser) + ")"
                        );
                    }
                });
                farPlayersList.forEach(function (player) {
                    var farUser = usersInfoList.filter(function (user) {
                        return user.groupId == player.groupId;
                    })[0];
                    if (farUser) {
                        drawFarPlayer(
                            player.angleDeg,
                            farUser.team,
                            farUser.name + " (" + CalcTotalScore(farUser) + ")"
                        );
                    }
                });
                drawPlayer(
                    user.x,
                    user.y,
                    user.radius,
                    user.team,
                    user.playerType,
                    user.name + " (" + CalcTotalScore(user) + ")"
                );
                lastUpdateTime = Date.now();


                ctx.beginPath();
                ctx.strokeStyle = '	rgb(0,191,255)';
                ctx.lineWidth = 4;
                activeShots.forEach(function (shot) {
                    ctx.moveTo(shot.x - user.x + visibleWidth / 2 + shot.r, shot.y - user.y + visibleHeight / 2);
                    ctx.arc(shot.x - user.x + visibleWidth / 2, shot.y - user.y + visibleHeight / 2, shot.r, 0, Math.PI * 2);
                    shot.r *= 0.8;
                });
                activeShots = activeShots.filter(function (shot) {
                    return shot.r > 1;
                });
                ctx.stroke();
            }
        }, 50);

        if (keydownEventListener) {
            document.removeEventListener('keydown', keydownEventListener);
        }
        if (mousedownEventListener) {
            canvas.removeEventListener('mousedown', mousedownEventListener);
        }
        if (mouseoutEventListener) {
            canvas.removeEventListener('mouseout', mouseoutEventListener);
        }
        if (mouseupEventListener) {
            canvas.removeEventListener('mouseup', mouseupEventListener);
        }
        if (mousemoveEventListener) {
            canvas.removeEventListener('mousemove', mousemoveEventListener);
        }

        keydownEventListener = function (e) {
            if ($scope.gameState.val != 'game') {
                return;
            }
            if (e.keyCode == 32) {
                if (user.boostSize >= user.shotNeed) {
                    socket.emit('shot', {
                        x: user.x,
                        y: user.y
                    });
                    user.boostSize -= user.shotNeed;
                    activeShots.push({
                        x: user.x,
                        y: user.y,
                        r: user.shotRadius
                    });
                }
                e.preventDefault();
            }
            if (e.keyCode == 88) {
                if (user.boostSize >= user.xRayNeed) {
                    socket.emit('xRay', {});
                    xRayOn = true;
                    user.boostSize -= user.xRayNeed;
                    setTimeout(function () {
                        xRayOn = false;
                    }, 1000);
                }
            }
        };
        document.addEventListener('keydown', keydownEventListener);

        mousedownEventListener = function (e) {
            if ($scope.gameState.val != 'game') {
                return;
            }
            speedUpOn = true;
            socket.emit('speedUpOn', {});
        };
        canvas.addEventListener('mousedown', mousedownEventListener);

        mouseoutEventListener = function (e) {
            if ($scope.gameState.val != 'game') {
                return;
            }
            if (speedUpOn) {
                speedUpOn = false;
                socket.emit('speedUpOff', {});
            }
        };
        canvas.addEventListener('mouseout', mouseoutEventListener);

        mouseupEventListener = function (e) {
            if ($scope.gameState.val != 'game') {
                return;
            }
            if (speedUpOn) {
                speedUpOn = false;
                socket.emit('speedUpOff', {});
            }
        };
        canvas.addEventListener('mouseup', mouseupEventListener);

        mousemoveEventListener = function (e) {
            if ($scope.gameState.val != 'game') {
                return;
            }
            function getMousePos(canvas, evt) {
                var rect = canvas.getBoundingClientRect();
                return {
                    x: evt.clientX - rect.left,
                    y: evt.clientY - rect.top
                };
            }

            //console.log(getMousePos(canvas, e));
            var point = getMousePos(canvas, e);
            socket.emit('changeDirection', {
                dx: point.x - visibleWidth / 2,
                dy: point.y - visibleHeight / 2
            });
        };
        canvas.addEventListener('mousemove', mousemoveEventListener);
    }
});
