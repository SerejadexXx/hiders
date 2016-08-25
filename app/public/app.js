var module = angular.module('indexApp', []);

module.service('srvAuth', function() {
    this.watchLoginChange = function() {

        var _self = this;

        FB.Event.subscribe('auth.authResponseChange', function(res) {

            if (res.status === 'connected') {

                /*
                 The user is already logged,
                 is possible retrieve his personal info
                 */
                _self.getUserInfo();

                /*
                 This is also the point where you should create a
                 session for the current user.
                 For this purpose you can use the data inside the
                 res.authResponse object.
                 */

            }
            else {

                /*
                 The user is not logged to the app, or into Facebook:
                 destroy the session on the server.
                 */

            }

        });

    }
});

module.run(['$rootScope', '$window', 'srvAuth',
    function($rootScope, $window, sAuth) {

        $rootScope.user = {};

        $window.fbAsyncInit = function() {
            // Executed when the SDK is loaded

            FB.init({

                /*
                 The app id of the web app;
                 To register a new app visit Facebook App Dashboard
                 ( https://developers.facebook.com/apps/ )
                 */

                appId: '327655160958274',

                /*
                 Adding a Channel File improves the performance
                 of the javascript SDK, by addressing issues
                 with cross-domain communication in certain browsers.
                 */

                channelUrl: 'app/channel.html',

                /*
                 Set if you want to check the authentication status
                 at the start up of the app
                 */

                status: true,

                /*
                 Enable cookies to allow the server to access
                 the session
                 */

                cookie: true,

                /* Parse XFBML */

                xfbml: true
            });
            $rootScope.$apply(function() {
                $rootScope.FBReady = 1;
            });

            sAuth.watchLoginChange();

        };

        (function(d){
            // load the Facebook javascript SDK

            var js,
                id = 'facebook-jssdk',
                ref = d.getElementsByTagName('script')[0];

            if (d.getElementById(id)) {
                return;
            }

            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";

            ref.parentNode.insertBefore(js, ref);

        }(document));

    }]
);

module.filter('formatSeconds', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);

module.constant('ASSETS', {
    playerTeams: [
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
    ],
    playerTypes: [
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
    ],
    teamsInfoSrc: [{
        src: '/assets/scissors_ico.png'
    }, {
        src: '/assets/rocks_ico.png'
    }, {
        src: '/assets/papers_ico.png'
    }]
});

module.service('segmentsFunctional', function() {
    var segments = [];
    var Width = 0;
    var Height = 0;
    this.GetWidth = function() {
        return Width;
    };
    this.GetHeight = function() {
        return Height;
    };
    this.Set = function(_segments) {
        segments = _segments;
        Width = 0;
        Height = 0;
        segments.forEach(function(segment) {
            Width = Math.max(Width, segment.p2.x);
            Height = Math.max(Height, segment.p2.y);
        });
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
    $timeout,
    ASSETS,
    $rootScope,
    $interval
) {
    $scope.showLanding = false;
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        $scope.showLanding = true;
        return;
    }

    $scope.ShareFB = function() {
        FB.ui(
            {
                method: 'feed',
                name: 'Hiders',
                link: 'http://hiders.rocks/',
                picture: 'http://hiders.rocks/assets/logo.png',
                caption: 'Hiders',
                description: 'Play new vision of paper-rock-scissors game!'
            },
            function(response) {
                if (response && response.post_id) {
                    //alert('Post was published.');
                    localStorage.setItem('sharedFB', '1');
                } else {
                    //alert('Post was not published.');
                }
            }
        );
    };
    $scope.ShowShit = false;
    $scope.CloseShit = function() {
        $scope.ShowShit = false;
    };
    $scope.FBReady = $rootScope.FBReady;
    $rootScope.$watch('FBReady', function() {
        $scope.FBReady = $rootScope.FBReady;
    });

    var lastAdShow = Date.now();
    var canShowAd = false;
    $interval(function() {
        if (Date.now() < lastAdShow + 3 * 60 * 1000) {
            return;
        }
        if (localStorage.getItem('sharedFB') != '1' && canShowAd) {
            $scope.ShowShit = true;
            lastAdShow = Date.now();
        }
    }, 200);

    var mainInterval;
    var keydownEventListener;
    var mousedownEventListener;
    var mouseoutEventListener;
    var mouseupEventListener;
    var mousemoveEventListener;
    $scope.viewState = 'list';
    $rootScope.$broadcast('startRules');
    $scope.serverError = null;
    $scope.userName = '';
    var processing = false;
    $scope.EnterRoom = function() {
        if (!processing) {
            var ConvertName = function(str) {
                var rez = "";
                for (var i = 0; i < str.length; i++) {
                    if (str[i] == '<' || str[i] == '>') {
                        rez = rez + "_";
                    } else {
                        rez = rez + str[i];
                    }
                }
                return rez || "Anonymous";
            };
            $scope.serverError = null;
            processing = true;
            $http.get('/rooms/free', {}).then(
                function(response) {
                    $scope.userName = ConvertName($scope.enteredName.val);
                    processing = false;
                    $scope.viewState = 'room';
                    startGame(response.data.address, $scope.userName);
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
        $scope.playerTeams = JSON.parse(JSON.stringify(ASSETS.playerTeams));
        $scope.playerTypeObj = null;
        $scope.playerTeam = null;
        $scope.playerTeamObj = null;
        $scope.playerTypes = JSON.parse(JSON.stringify(ASSETS.playerTypes));
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
        $scope.teamsInfo = JSON.parse(JSON.stringify(ASSETS.teamsInfoSrc));
        $scope.teamsInfo.forEach(function(team, key) {
            team.color = $scope.playerTeams[key].color;
            team.disp = $scope.playerTeams[key].disp;
        });
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
            if($scope.$$phase) {
                $scope.viewState = 'list';
                $rootScope.$broadcast('startRules');
            } else {
                $scope.$apply(function () {
                    $scope.viewState = 'list';
                    $rootScope.$broadcast('startRules');
                });
            }
        });
        $scope.LeaveRoom = function() {
            socket.disconnect();
        };
        $scope.BackToGame = function() {
            $scope.winnerState.val = 'off';
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
                    if (data.showTopScores) {
                        $scope.winnerState.winnerList = JSON.parse(JSON.stringify($scope.topScores));
                        $scope.winnerState.user = JSON.parse(JSON.stringify(user));
                    } else {
                        $scope.winnerState.winnerList = null;
                        canShowAd = true;
                    }
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
                //console.log($scope.winnerState.winnerList);
                if ($scope.winnerState.winnerList == null) {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.winnerState.val = 'off';
                            canShowAd = false;
                        });
                    }, 2000);
                }
            }

        });

        var drawPlayer = function (x, y, r, team, playerType, name, boost) {
            if (team == null || playerType == null) {
                console.error('user team or playerType undefined');
                console.log(team);
                console.log(playerType);
                console.log('name: ' + name);
                return;
            }
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
            if (boost != null) {
                ctx.fillStyle = 'rgba(255,165,0, 0.3)';

                ctx.fillRect(
                    x - user.x + visibleWidth / 2 - r,
                    y - user.y + visibleHeight / 2 + r - 2 * r * boost.boostSize / boost.maxBoost,
                    x - user.x + visibleWidth / 2 + r,
                    y - user.y + visibleHeight / 2 + r
                );
            }
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
                ctx.strokeStyle = 'lightgrey';
                ctx.lineWidth = 1;

                for (var dx = -(visibleWidth / 2 - visibleWidth / 2 % 20); dx <= segmentsFunctional.GetWidth() + visibleWidth; dx += 20) {
                    ctx.moveTo(
                        dx - user.x + visibleWidth / 2,
                        segmentsFunctional.GetHeight() - user.y + visibleHeight / 2 + visibleHeight / 2
                    );
                    ctx.lineTo(
                        dx - user.x + visibleWidth / 2,
                        0 - user.y + visibleHeight / 2 - visibleHeight / 2
                    );
                    /*
                    ctx.moveTo(
                        dx - user.x + visibleWidth / 2,
                        0 - user.y + visibleHeight / 2
                    );
                    ctx.lineTo(
                        dx - user.x + visibleWidth / 2,
                        0 - user.y + visibleHeight / 2 - visibleHeight / 2
                    );
                    ctx.moveTo(
                        dx - user.x + visibleWidth / 2,
                        segmentsFunctional.GetHeight() - user.y + visibleHeight / 2
                    );
                    ctx.lineTo(
                        dx - user.x + visibleWidth / 2,
                        segmentsFunctional.GetHeight() - user.y + visibleHeight / 2 + visibleHeight / 2
                    );
                    */
                }
                for (var dy = -(visibleHeight / 2 - visibleHeight / 2 % 20); dy <= segmentsFunctional.GetHeight() + visibleHeight; dy += 20) {
                    ctx.moveTo(
                        segmentsFunctional.GetWidth() - user.x + visibleWidth / 2 + visibleWidth / 2,
                        dy - user.y + visibleHeight / 2
                    );
                    ctx.lineTo(
                        0 - user.x + visibleWidth / 2 - visibleWidth / 2,
                        dy - user.y + visibleHeight / 2
                    );
                    /*ctx.moveTo(
                        0 - user.x + visibleWidth / 2,
                        dy - user.y + visibleHeight / 2
                    );
                    ctx.lineTo(
                        0 - user.x + visibleWidth / 2 - visibleWidth / 2,
                        dy - user.y + visibleHeight / 2
                    );
                    ctx.moveTo(
                        segmentsFunctional.GetWidth() - user.x + visibleWidth / 2,
                        dy - user.y + visibleHeight / 2
                    );
                    ctx.lineTo(
                        segmentsFunctional.GetWidth() - user.x + visibleWidth / 2 + visibleWidth / 2,
                        dy - user.y + visibleHeight / 2
                    );*/
                }
                ctx.stroke();

                ctx.beginPath();
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.moveTo(0 - user.x + visibleWidth / 2 - 60, 0 - user.y + visibleHeight / 2 - 60);
                ctx.lineTo(segmentsFunctional.GetWidth() - user.x + visibleWidth / 2 + 60, 0 - user.y + visibleHeight / 2 - 60);
                ctx.lineTo(segmentsFunctional.GetWidth() - user.x + visibleWidth / 2 + 60, segmentsFunctional.GetHeight() - user.y + visibleHeight / 2 + 60);
                ctx.lineTo(0 - user.x + visibleWidth / 2 - 60, segmentsFunctional.GetHeight() - user.y + visibleHeight / 2 + 60);
                ctx.lineTo(0 - user.x + visibleWidth / 2 - 60, 0 - user.y + visibleHeight / 2 - 60);
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = 'black';
                ctx.setLineDash([3, 6]);
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
                    user.name + " (" + CalcTotalScore(user) + ")",
                    {
                        boostSize: user.boostSize,
                        maxBoost: user.maxBoost
                    }
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

module.controller('rulesCtrl', function(
    $scope,
    ASSETS
) {
    var canvas = document.getElementById('mainLogo');
    var ctx = canvas.getContext('2d');
    var curTime = 0;

    var logo = new Image();
    logo.src = '/assets/logo.png';
    var ImageList = [];
    ASSETS.playerTeams.forEach(function (team) {
        var ImagePlayerTypesList = [];
        ASSETS.playerTypes.forEach(function (playerType) {
            var newImage = new Image();
            newImage.src = team.src + playerType.src;

            ImagePlayerTypesList.push({
                img: newImage,
                color: playerType.color,
                disp: playerType.disp
            });
        });
        ImageList.push({
            imgs: ImagePlayerTypesList,
            color: team.color,
            disp: team.disp
        });
    });

    var TeamsList = [];
    ASSETS.teamsInfoSrc.forEach(function(team, key) {
        var newImage = new Image();
        newImage.src = team.src;

        TeamsList.push({
            img: newImage,
            color: ImageList[key].color,
            disp: ImageList[key].disp
        });
    });

    var drawImage = function(x, y, size, img, borderColor) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        ctx.restore();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var drawText = function(x, y, size, text, color, align) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.font = size + 'px Raleway';
        ctx.textAlign="center";
        if (align) {
            ctx.textAlign = align;
        }
        ctx.strokeText(text, x, y);
    };

    var drawPointer = function(x1, y1, x2, y2, side) {
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.moveTo(x2, y2);
        var dx = x2 - x1;
        var dy = y2 - y1;
        var d = Math.pow(dx * dx + dy * dy, 0.5);
        var angle = Math.atan2(dy, dx);
        ctx.lineTo(Math.round(x1 - Math.cos(angle) * 2), Math.round(y1 - Math.sin(angle) * 2));
        ctx.moveTo(x1, y1);
        ctx.lineTo(Math.round(x1 + Math.cos(angle + 0.5) * side), Math.round(y1 + Math.sin(angle + 0.5) * side));
        ctx.moveTo(x1, y1);
        ctx.lineTo(Math.round(x1 + Math.cos(angle - 0.5) * side), Math.round(y1 + Math.sin(angle - 0.5) * side));
        ctx.stroke();
    };
    //curTime = 47500;
    var moments = [
        {
            desc: 'here are rule',
            execute: function(time) {
                drawText(300, 120, 20, 'Here are rules', 'orange');
                ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - time / 1000) + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            },
            lastsFor: 2000
        },
        {
            desc: 'it is just N seconds',
            execute: function(time) {
                drawText(300, 120, 20, 'Here are rules', 'orange');
                drawText(300, 160, 18, 'It will take just one minute...');
                ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - time / 1000) + ')';
                ctx.fillRect(0, 145, canvas.width, canvas.height);
            },
            lastsFor: 2000
        },
        {
            desc: 'it is just N seconds - 2',
            execute: function(time) {
                drawText(300, 120, 20, 'Here are rules', 'orange');
                drawText(300, 160, 18, 'It will take just one minute...');
            },
            lastsFor: 500
        },
        {
            desc: 'it is just N seconds',
            execute: function(time) {
                drawText(300, 120, 20, 'Here are rules', 'orange');
                drawText(300, 160, 18, 'It will take just one minute...');
                ctx.fillStyle = 'rgba(255, 255, 255, ' + (time / 1000) + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            },
            lastsFor: 1000
        },
        {
            desc: 'images appears',
            execute: function(time) {
                TeamsList.forEach(function(team, key) {
                    drawImage(130 + key * 170, 100, 100, team.img, team.color);
                    //drawText(130 + key * 170, 200, 18, team.disp, team.color);
                });

                ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - time / 1000) + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            },
            lastsFor: 1000
        },
        {
            desc: 'text appears',
            execute: function(time) {
                TeamsList.forEach(function(team, key) {
                    drawImage(130 + key * 170, 100, 100, team.img, team.color);
                    drawText(130 + key * 170, 200, 18, team.disp, team.color);
                });

                ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - time / 1000) + ')';
                ctx.fillRect(0, 185, canvas.width, canvas.height);
            },
            lastsFor: 500
        },
        {
            desc: 'stable',
            execute: function(time) {
                TeamsList.forEach(function(team, key) {
                    drawImage(130 + key * 170, 100, 100, team.img, team.color);
                    drawText(130 + key * 170, 200, 18, team.disp, team.color);
                });
            },
            lastsFor: 1000
        },
        {
            desc: 'text disappears',
            execute: function(time) {
                TeamsList.forEach(function(team, key) {
                    drawImage(130 + key * 170, 100, 100, team.img, team.color);
                    drawText(130 + key * 170, 200, 18, team.disp, team.color);
                });

                ctx.fillStyle = 'rgba(255, 255, 255, ' + (time / 1000) + ')';
                ctx.fillRect(0, 185, canvas.width, canvas.height);
            },
            lastsFor: 1000
        },
        {
            desc: 'move to triangle positions',
            execute: function(time) {
                drawImage(130 + time / 30, 100 - time / 60, 100, TeamsList[0].img, TeamsList[0].color);
                drawImage(130 + 1 * 170, 100 + time / 31, 100, TeamsList[1].img, TeamsList[1].color);
                drawImage(130 + 2 * 170 - time / 30, 100 - time / 60, 100, TeamsList[2].img, TeamsList[2].color);
            },
            lastsFor: 2200
        },
        {
            execute: function(time) {
                drawPointer(240, 110, 260, 130, 15);
                drawPointer(340, 65, 260, 65, 15);
                drawPointer(340, 130, 360, 110, 15);
                drawText(80, 50, 15, 'Scissors hits papers', 'black');
                drawText(440, 150, 15, 'Papers hits rocks', 'black');
                drawText(140, 150, 15, 'Rocks hits scissors', 'black');
                var trans;
                if (time < 1000) {
                    trans = 1 - time / 1000;
                } else
                if (time < 2000) {
                    trans = 0;
                } else {
                    trans = (time - 2000) / 1000;
                }
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                time = 2200;
                drawImage(130 + time / 30, 100 - time / 60, 100, TeamsList[0].img, TeamsList[0].color);
                drawImage(130 + 1 * 170, 100 + time / 31, 100, TeamsList[1].img, TeamsList[1].color);
                drawImage(130 + 2 * 170 - time / 30, 100 - time / 60, 100, TeamsList[2].img, TeamsList[2].color);
            },
            lastsFor: 3000
        },
        {
            desc: 'move back to linear positions',
            execute: function(time) {
                time = 2200 - time;
                drawImage(130 + time / 30, 100 - time / 60, 100, TeamsList[0].img, TeamsList[0].color);
                drawImage(130 + 1 * 170, 100 + time / 31, 100, TeamsList[1].img, TeamsList[1].color);
                drawImage(130 + 2 * 170 - time / 30, 100 - time / 60, 100, TeamsList[2].img, TeamsList[2].color);
            },
            lastsFor: 2200
        },
        {
            desc: 'right circle disappears, second on its position',
            execute: function(time) {
                drawText(300, 200, 18, 'Catch enemy to hit!', TeamsList[2].color);
                var trans = 1 - time / 1000;
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawImage(130 + time * (220 - 130) / 1000, 100, 100, TeamsList[0].img, TeamsList[0].color);
                drawImage(130 + 1 * 170 + time * (380 - 300) / 1000, 100, 100, TeamsList[1].img, TeamsList[1].color);
                drawImage(130 + 2 * 170 + time / 3, 100, 100, TeamsList[2].img, TeamsList[2].color);
            },
            lastsFor: 1000
        },
        {
            desc: 'second catch first',
            execute: function(time) {
                drawText(300, 200, 18, 'Catch enemy to hit!', TeamsList[2].color);
                drawImage(220, 100, 100, TeamsList[0].img, TeamsList[0].color);
                drawImage(380 - time * 80 / 1000, 100, 100, TeamsList[1].img, TeamsList[1].color);
            },
            lastsFor: 1000
        },
        {
            desc: 'After hit enemy comes to your team...',
            execute: function(time) {
                drawText(300, 200, 18, 'After hit enemy comes to your team...', TeamsList[1].color);
                drawImage(220, 100, 100, TeamsList[1].img, TeamsList[1].color);
                drawImage(300, 100, 100, TeamsList[1].img, TeamsList[1].color);
            },
            lastsFor: 2000
        },
        {
            desc: 'You earn some points!',
            execute: function(time) {
                drawText(300, 200, 18, 'You earn some points!', TeamsList[1].color);
                drawImage(220, 100, 100, TeamsList[1].img, TeamsList[1].color);
                drawImage(300, 100, 100, TeamsList[1].img, TeamsList[1].color);
            },
            lastsFor: 2000
        },
        {
            desc: 'Catched one lose!',
            execute: function(time) {
                drawText(300, 200, 18, 'Catched one lose points!', TeamsList[2].color);
                drawImage(220, 100, 100, TeamsList[1].img, TeamsList[1].color);
                drawImage(300, 100, 100, TeamsList[1].img, TeamsList[1].color);
            },
            lastsFor: 2000
        },
        {
            desc: 'The more points he have the more you earned!',
            execute: function(time) {
                drawText(300, 200, 18, 'The more points he have the more you earn!', TeamsList[1].color);
                drawImage(220, 100, 100, TeamsList[1].img, TeamsList[1].color);
                drawImage(300, 100, 100, TeamsList[1].img, TeamsList[1].color);
            },
            lastsFor: 1000
        },
        {
            desc: 'The more points he have the more you earn! - disappears',
            execute: function(time) {
                drawText(300, 200, 18, 'The more points he have the more you earn!', TeamsList[1].color);
                drawImage(220, 100, 100, TeamsList[1].img, TeamsList[1].color);
                drawImage(300, 100, 100, TeamsList[1].img, TeamsList[1].color);
                var trans = time / 1000;
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            },
            lastsFor: 1000
        },
        {
            desc: 'Vision',
            execute: function(time) {
                //drawText(300, 200, 18, 'More points he had, more you earned!', TeamsList[1].color);
                var x = 300;
                var y = 140;
                var grd = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, 150
                );
                grd.addColorStop(0, 'rgba(0, 255, 0, ' + (Math.random() / 50 + 1 / 8) + ')');
                grd.addColorStop(1, "white");

                ctx.beginPath();
                ctx.fillStyle = grd;
                ctx.arc(x, y, 150, 0, 2 * Math.PI);
                ctx.fill();

                drawImage(x, y, 60, TeamsList[2].img, TeamsList[2].color);

                drawText(70, 50, 15, 'Light green around', 'black');
                drawText(70, 70, 15, 'is vision!', 'black');

                var trans = 1 - time / 1000;
                if (trans < 0) {
                    trans = 0;
                }
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            },
            lastsFor: 2000
        },
        {
            desc: 'Vision - 2',
            execute: function(time) {
                drawText(70, 90, 15, 'Walls block vision!', 'black');
                drawText(75, 110, 15, 'Only players in vision', 'black');
                drawText(75, 130, 15, 'are visible!', 'black');
                var trans = 1 - time / 1000;
                if (trans < 0) {
                    trans = 0;
                }
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //drawText(300, 200, 18, 'More points he had, more you earned!', TeamsList[1].color);
                var x = 300;
                var y = 140;
                var grd = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, 150
                );
                grd.addColorStop(0, 'rgba(0, 255, 0, ' + (Math.random() / 50 + 1 / 8) + ')');
                grd.addColorStop(1, "white");

                var angle1 = Math.atan2(-100, -70);
                var angle2 = Math.atan2(-30, -70);
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, 150, angle1, angle2);
                ctx.lineTo(x - 70, y - 30);
                ctx.lineTo(x - 70, y - 100);
                ctx.lineTo(x + Math.cos(angle2) * 150, y + Math.cos(angle2) * 150);
                ctx.clip();
                ctx.beginPath();
                ctx.fillStyle = grd;
                ctx.arc(x, y, 150, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();

                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - 70, y - 30);
                ctx.lineTo(x - 70, y - 100);
                ctx.stroke();

                ctx.setLineDash([3, 6]);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - 72, y - 30);
                ctx.lineTo(x - 72, y - 100);
                ctx.moveTo(x - 67, y - 30);
                ctx.lineTo(x - 67, y - 100);
                ctx.stroke();
                ctx.setLineDash([]);

                drawImage(x, y, 60, TeamsList[2].img, TeamsList[2].color);

                drawText(70, 50, 15, 'Light green around', 'black');
                drawText(70, 70, 15, 'is vision!', 'black');
            },
            lastsFor: 3000
        },
        {
            desc: 'Vision - 3',
            execute: function(time) {
                drawText(505, 200, 15, 'Also you will see', 'black');
                drawText(505, 220, 15, 'info about far players', 'black');
                drawText(505, 240, 15, 'near border of the screen', 'black');
                var trans = 1 - time / 1000;
                if (trans < 0) {
                    trans = 0;
                }
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //drawText(300, 200, 18, 'More points he had, more you earned!', TeamsList[1].color);
                var x = 300;
                var y = 140;
                var grd = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, 150
                );
                grd.addColorStop(0, 'rgba(0, 255, 0, ' + (Math.random() / 50 + 1 / 8) + ')');
                grd.addColorStop(1, "white");

                var angle1 = Math.atan2(-100, -70);
                var angle2 = Math.atan2(-30, -70);
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, 150, angle1, angle2);
                ctx.lineTo(x - 70, y - 30);
                ctx.lineTo(x - 70, y - 100);
                ctx.lineTo(x + Math.cos(angle2) * 150, y + Math.cos(angle2) * 150);
                ctx.clip();
                ctx.beginPath();
                ctx.fillStyle = grd;
                ctx.arc(x, y, 150, 0, 2 * Math.PI);
                ctx.fill();
                ctx.restore();

                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - 70, y - 30);
                ctx.lineTo(x - 70, y - 100);
                ctx.stroke();

                ctx.setLineDash([1, 6]);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - 72, y - 30);
                ctx.lineTo(x - 72, y - 100);
                ctx.moveTo(x - 67, y - 30);
                ctx.lineTo(x - 67, y - 100);
                ctx.stroke();
                ctx.setLineDash([]);

                drawImage(x, y, 60, TeamsList[2].img, TeamsList[2].color);

                drawText(70, 50, 15, 'Light green around', 'black');
                drawText(70, 70, 15, 'is vision!', 'black');
                drawText(70, 90, 15, 'Walls block vision!', 'black');
                drawText(75, 110, 15, 'Only players in vision', 'black');
                drawText(75, 130, 15, 'are visible!', 'black');
            },
            lastsFor: 3000
        },
        {
            desc: 'Moving',
            execute: function(time) {
                drawText(100, 30, 15, 'Move cursor to set direction', 'black');
                drawText(90, 50, 15, 'You can\'t cross any wall!', 'black');
                var trans = 1 - time / 1000;
                if (trans < 0) {
                    trans = 0;
                }
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //drawText(300, 200, 18, 'More points he had, more you earned!', TeamsList[1].color);
                var x = 300;
                var y = 140;
                var grd = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, 150
                );
                grd.addColorStop(0, 'rgba(0, 255, 0, ' + (Math.random() / 50 + 1 / 8) + ')');
                grd.addColorStop(1, "white");

                ctx.beginPath();
                ctx.fillStyle = grd;
                ctx.arc(x, y, 150, 0, 2 * Math.PI);
                ctx.fill();

                drawImage(x, y, 60, TeamsList[1].img, TeamsList[1].color);
            },
            lastsFor: 2000
        },
        {
            desc: 'Moving - 2',
            execute: function(time) {
                drawText(505, 30, 15, 'Click to increase speed', 'orange');
                drawText(505, 50, 15, 'Boost is finite!', 'orange');
                drawText(505, 70, 15, 'Don\'t waste it!', 'orange');

                var trans = 1 - time / 1000;
                if (trans < 0) {
                    trans = 0;
                }
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //drawText(300, 200, 18, 'More points he had, more you earned!', TeamsList[1].color);
                var x = 300;
                var y = 140;
                var grd = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, 150
                );
                grd.addColorStop(0, 'rgba(0, 255, 0, ' + (Math.random() / 50 + 1 / 8) + ')');
                grd.addColorStop(1, "white");

                ctx.beginPath();
                ctx.fillStyle = grd;
                ctx.arc(x, y, 150, 0, 2 * Math.PI);
                ctx.fill();

                drawText(100, 30, 15, 'Move cursor to set direction', 'black');
                drawText(90, 50, 15, 'You can\'t cross any wall!', 'black');

                drawImage(x, y, 60, TeamsList[1].img, TeamsList[1].color);
            },
            lastsFor: 3000
        },
        {
            desc: 'Moving - 3',
            execute: function(time) {
                drawText(70, 180, 15, 'Space to', 'rgb(0, 191, 255)');
                drawText(80, 200, 15, 'crash walls near you', 'rgb(0, 191, 255)');
                drawText(90, 220, 15, 'Also costs some boost', 'rgb(0, 191, 255)');

                var trans = 1 - time / 1000;
                if (trans < 0) {
                    trans = 0;
                }
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //drawText(300, 200, 18, 'More points he had, more you earned!', TeamsList[1].color);
                var x = 300;
                var y = 140;
                var grd = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, 150
                );
                grd.addColorStop(0, 'rgba(0, 255, 0, ' + (Math.random() / 50 + 1 / 8) + ')');
                grd.addColorStop(1, "white");

                ctx.beginPath();
                ctx.fillStyle = grd;
                ctx.arc(x, y, 150, 0, 2 * Math.PI);
                ctx.fill();

                drawText(100, 30, 15, 'Move cursor to set direction', 'black');
                drawText(90, 50, 15, 'You can\'t cross any wall!', 'black');
                drawText(505, 30, 15, 'Click to increase speed', 'orange');
                drawText(505, 50, 15, 'Boost is finite!', 'orange');
                drawText(505, 70, 15, 'Don\'t waste it!', 'orange');

                drawImage(x, y, 60, TeamsList[1].img, TeamsList[1].color);
            },
            lastsFor: 3000
        },
        {
            desc: 'Moving - 3',
            execute: function(time) {
                drawText(505, 160, 15, 'X creates x-ray!', 'rgb(0, 200, 0)');
                drawText(510, 180, 15, 'You can see', 'rgb(0, 200, 0)');
                drawText(510, 200, 15, 'through walls!', 'rgb(0, 200, 0)');
                drawText(510, 220, 15, 'Also costs some boost', 'rgb(0, 200, 0)');

                var trans = 1 - time / 1000;
                if (trans < 0) {
                    trans = 0;
                }
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //drawText(300, 200, 18, 'More points he had, more you earned!', TeamsList[1].color);
                var x = 300;
                var y = 140;
                var grd = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, 150
                );
                grd.addColorStop(0, 'rgba(0, 255, 0, ' + (Math.random() / 50 + 1 / 8) + ')');
                grd.addColorStop(1, "white");

                ctx.beginPath();
                ctx.fillStyle = grd;
                ctx.arc(x, y, 150, 0, 2 * Math.PI);
                ctx.fill();

                drawText(100, 30, 15, 'Move cursor to set direction', 'black');
                drawText(90, 50, 15, 'You can\'t cross any wall!', 'black');
                drawText(505, 30, 15, 'Click to increase speed', 'orange');
                drawText(505, 50, 15, 'Boost is finite!', 'orange');
                drawText(505, 70, 15, 'Don\'t waste it!', 'orange');
                drawText(70, 180, 15, 'Space to', 'rgb(0, 191, 255)');
                drawText(80, 200, 15, 'crash walls near you', 'rgb(0, 191, 255)');
                drawText(90, 220, 15, 'Also costs some boost', 'rgb(0, 191, 255)');

                drawImage(x, y, 60, TeamsList[1].img, TeamsList[1].color);
            },
            lastsFor: 4000
        },
        {
            desc: 'Moving - 4',
            execute: function(time) {
                //drawText(300, 200, 18, 'More points he had, more you earned!', TeamsList[1].color);
                var x = 300;
                var y = 140;
                var grd = ctx.createRadialGradient(
                    x, y, 0,
                    x, y, 150
                );
                grd.addColorStop(0, 'rgba(0, 255, 0, ' + (Math.random() / 50 + 1 / 8) + ')');
                grd.addColorStop(1, "white");

                ctx.beginPath();
                ctx.fillStyle = grd;
                ctx.arc(x, y, 150, 0, 2 * Math.PI);
                ctx.fill();

                drawText(100, 30, 15, 'Move cursor to set direction', 'black');
                drawText(90, 50, 15, 'You can\'t cross any wall!', 'black');
                drawText(505, 30, 15, 'Click to increase speed', 'orange');
                drawText(505, 50, 15, 'Boost is finite!', 'orange');
                drawText(505, 70, 15, 'Don\'t waste it!', 'orange');
                drawText(70, 180, 15, 'Space to', 'rgb(0, 191, 255)');
                drawText(80, 200, 15, 'crash walls near you', 'rgb(0, 191, 255)');
                drawText(90, 220, 15, 'Also costs some boost', 'rgb(0, 191, 255)');
                drawText(505, 160, 15, 'X creates x-ray!', 'rgb(0, 200, 0)');
                drawText(510, 180, 15, 'You can see', 'rgb(0, 200, 0)');
                drawText(510, 200, 15, 'through walls!', 'rgb(0, 200, 0)');
                drawText(510, 220, 15, 'Also costs some boost', 'rgb(0, 200, 0)');

                drawImage(x, y, 60, TeamsList[1].img, TeamsList[1].color);
                var trans = time / 1000;
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            },
            lastsFor: 1000
        },
        {
            desc: 'Types of players',
            execute: function(time) {
                drawText(300, 230, 18, 'There are five types of players!', 'black');
                ImageList.forEach(function(team, teamKey) {
                    team.imgs.forEach(function(player, playerKey) {
                        drawImage(100 + playerKey * 100, 50 + teamKey * 60, 50, player.img, team.color);
                    });
                });
            },
            lastsFor: 2000
        },
        {
            desc: 'Types of players: Rayer',
            execute: function(time) {
                var playerKey = 0;
                ImageList.forEach(function(team, teamKey) {
                    var player = team.imgs[playerKey];
                    drawImage(100 + playerKey * 100, 50 + teamKey * 60, 50, player.img, team.color);
                });
                drawText(250, 50, 18, ImageList[0].imgs[playerKey].disp + ":", ImageList[0].imgs[playerKey].color);
                drawText(270, 70, 18, '+ Free x-ray', ImageList[0].imgs[playerKey].color, 'left');
                drawText(270, 90, 18, '- No shots', ImageList[0].imgs[playerKey].color, 'left');
            },
            lastsFor: 2000
        },
        {
            desc: 'Types of players: Booster',
            execute: function(time) {
                var playerKey = 1;
                ImageList.forEach(function(team, teamKey) {
                    var player = team.imgs[playerKey];
                    drawImage(100 + playerKey * 100, 50 + teamKey * 60, 50, player.img, team.color);
                });
                drawText(270, 50, 18, ImageList[0].imgs[playerKey].disp + ":", ImageList[0].imgs[playerKey].color);
                drawText(290, 70, 18, '+ Free shots', ImageList[0].imgs[playerKey].color, 'left');
                drawText(290, 90, 18, '- No x-ray', ImageList[0].imgs[playerKey].color, 'left');
            },
            lastsFor: 2000
        },
        {
            desc: 'Types of players: Hider',
            execute: function(time) {
                var playerKey = 2;
                ImageList.forEach(function(team, teamKey) {
                    var player = team.imgs[playerKey];
                    drawImage(100 + playerKey * 100, 50 + teamKey * 60, 50, player.img, team.color);
                });
                drawText(380, 50, 18, ImageList[0].imgs[playerKey].disp + ":", ImageList[0].imgs[playerKey].color, 'left');
                drawText(400, 70, 18, '+ Hides from x-ray', ImageList[0].imgs[playerKey].color, 'left');
            },
            lastsFor: 2000
        },
        {
            desc: 'Types of players: Booster',
            execute: function(time) {
                var playerKey = 3;
                ImageList.forEach(function(team, teamKey) {
                    var player = team.imgs[playerKey];
                    drawImage(100 + playerKey * 100, 50 + teamKey * 60, 50, player.img, team.color);
                });
                drawText(40, 50, 18, ImageList[0].imgs[playerKey].disp + ":", ImageList[0].imgs[playerKey].color, 'left');
                drawText(60, 70, 18, '+ More boost', ImageList[0].imgs[playerKey].color, 'left');
                drawText(60, 90, 18, '- expensive shots', ImageList[0].imgs[playerKey].color, 'left');
                drawText(60, 110, 18, '- expensive x-ray', ImageList[0].imgs[playerKey].color, 'left');
            },
            lastsFor: 3000
        },
        {
            desc: 'Types of players: Fatser',
            execute: function(time) {
                var playerKey = 4;
                ImageList.forEach(function(team, teamKey) {
                    var player = team.imgs[playerKey];
                    drawImage(100 + playerKey * 100, 50 + teamKey * 60, 50, player.img, team.color);
                });
                drawText(40, 50, 18, ImageList[0].imgs[playerKey].disp + ":", 'black', 'left');
                drawText(60, 70, 18, '+ Faster speed', 'black', 'left');
                drawText(60, 90, 18, '+ Better effect of boost', 'black', 'left');
                drawText(60, 110, 18, '- no shots', 'black', 'left');
                drawText(60, 130, 18, '- no x-ray', 'black', 'left');
                drawText(60, 150, 18, '- small amount of boost', 'black', 'left');
            },
            lastsFor: 3000
        },
        {
            desc: 'Round',
            execute: function(time) {
                drawImage(200, 70, 60, ImageList[0].imgs[0].img, ImageList[0].color);
                drawImage(400, 90, 60, ImageList[1].imgs[2].img, ImageList[1].color);
                drawImage(300, 130, 60, ImageList[2].imgs[3].img, ImageList[2].color);
                drawText(300, 230, 18, 'Round lasts for 30 minutes!', 'black');
            },
            lastsFor: 2000
        },
        {
            desc: 'Round - 2',
            execute: function(time) {
                drawImage(200, 70, 60, ImageList[0].imgs[0].img, ImageList[0].color);
                drawImage(400, 90, 60, ImageList[1].imgs[2].img, ImageList[1].color);
                drawImage(300, 130, 60, ImageList[2].imgs[3].img, ImageList[2].color);
                drawText(300, 210, 18, 'After some team is empty', 'black');
                drawText(300, 230, 18, 'players will be reselected by teams', 'black');
            },
            lastsFor: 2000
        },
        {
            desc: 'Round Winner',
            execute: function(time) {
                drawImage(200, 70, 60, ImageList[0].imgs[0].img, ImageList[0].color);
                drawImage(400, 90, 60, ImageList[1].imgs[2].img, ImageList[1].color);
                drawImage(300, 130, 60, ImageList[2].imgs[3].img, ImageList[2].color);
                drawText(300, 230, 18, 'Winner is player with maximal score after the end of the round!', 'black');
            },
            lastsFor: 2000
        },
        {
            desc: 'Enjoy!',
            execute: function(time) {
                drawText(300, 150, 20, 'Enjoy! :)', 'black');
            },
            lastsFor: 1000
        },
        {
            desc: 'Enjoy! - 2',
            execute: function(time) {
                drawText(300, 150, 20, 'Enjoy! :)', 'black');
                var trans = time / 1000;
                ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            },
            lastsFor: 1000
        },
        {
            desc: 'Final',
            execute: function(time) {
                ctx.drawImage(logo, 0, 0, canvas.width, canvas.height);
                var trans = 1 - time / 1000;
                if (trans > 0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, ' + trans + ')';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            },
            lastsFor: 1000000000000000
        }
    ];

    $scope.$on('startRules', function() {
        curTime = 0;
    });

    var Draw = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var cT = curTime;
        for (var it = 0; it < moments.length; it++) {
            if (moments[it].lastsFor >= cT) {
                moments[it].execute(cT);
                break;
            } else {
                cT -= moments[it].lastsFor;
            }
        }
    };

    var totLen = 1000;
    moments.forEach(function(moment) {
        if (moment.lastsFor < 1000000) {
            totLen += moment.lastsFor;
        }
    });

    $scope.curProgress = Math.round(curTime / totLen * 405);

    var playerLine = document.getElementById('idManLogoBackground');
    var mouseDown = false;
    document.addEventListener('mousedown', function(evt) {
        var rect = playerLine.getBoundingClientRect();
        var x = evt.clientX - rect.left;
        curTime = x / 405 * totLen;
        if (curTime < 0) {
            curTime = 0;
        }
        if (curTime > totLen) {
            curTime = totLen;
        }
        $scope.$apply(function() {
            $scope.curProgress = Math.round(curTime / totLen * 405);
        });
        mouseDown = true;
    });
    document.addEventListener('mousemove', function(evt) {
        if (mouseDown) {
            var rect = playerLine.getBoundingClientRect();
            var x = evt.clientX - rect.left;
            curTime = x / 405 * totLen;
            if (curTime < 0) {
                curTime = 0;
            }
            if (curTime > totLen) {
                curTime = totLen;
            }
            $scope.$apply(function () {
                $scope.curProgress = Math.round(curTime / totLen * 405);
            });
        }
    });
    document.addEventListener('mouseout', function(evt) {
       var from = evt.relatedTarget || evt.toElement;
       if (!from || from.nodeName == "HTML") {
           if (mouseDown) {
               mouseDown = false;
           }
       }
    });
    document.addEventListener('mouseup', function(evt) {
        if (mouseDown) {
            mouseDown = false;
        }
    });

    setInterval(function() {
        curTime += 50;
        if (curTime > totLen) {
            curTime = totLen;
        }
        $scope.$apply(function() {
            $scope.curProgress = Math.round(curTime / totLen * 405);
        });
        Draw();
    }, 50);
});
