var sockets = require('socket.io');
var users = require('./../models/users.js');
var mazes = require('./../models/mazes.js');

module.exports = {
    Start: function(http, app) {
        app.get('/room/info', function(req, res) {
            res.json({
                amount: usersSet.GetActive()
            });
        });

        var io = sockets(http);
        var usersSet = new users.Set();
        var segmentsSet = new mazes.Set();
        segmentsSet.Generate();
        var roundId = 0;
        var gameLength = 5 * 60;

        var gameState = {
            val: 'waiting',
            timeRemaining: gameLength
        };

        var AssertInputDouble = function(val, min, max) {
            if (val == null) {
                return false;
            }
            if (isNaN(val)) {
                return false;
            }
            if (min <= val && val <= max) {
                return true;
            }
            return false;
        };

        var AssertInputInteger = function(val, min, max) {
            if (val == null) {
                return false;
            }
            if (isNaN(val)) {
                return false;
            }
            if (val % 1 != 0) {
                return false;
            }
            if (min <= val && val <= max) {
                return true;
            }
            return false;
        };

        var AssertInputString = function(val, maxLength) {
            if (!val) {
                return false;
            }
            if (val.indexOf('<') != -1) {
                return false;
            }
            if ((typeof val) == 'string') {
                if (val.length <= maxLength) {
                    return true;
                }
            }
            return false;
        };

        var CheckEnd = function(forced) {
            var winner = usersSet.HaveWinner();
            if (winner != -1 && gameState.val == 'game') {
                io.emit('infoUpdate', {
                    winnerTeam: winner
                });
                usersSet.UpdateData();
                segmentsSet.Generate();
                roundId++;
                gameState.timeRemaining = gameLength;
                gameState.val = 'waiting';
                return;
            }
            if (forced) {
                winner = usersSet.GetLeadingTeam();
                io.emit('infoUpdate', {
                    winnerTeam: winner
                });
                usersSet.UpdateData();
                segmentsSet.Generate();
                roundId++;
                gameState.timeRemaining = gameLength;
                gameState.val = 'waiting';
            }
        };

        io.on('connection', function(socket) {
            var id = null;
            var updater = null;
            var roundUpdater = null;
            var socketTeamsUpdateId = roundId;
            var loginUpdater = null;
            socket.on('data', function(data) {
                if (!data) {
                    return;
                }
                if (!AssertInputString(data.userName, 15)) {
                    return;
                }
                if (!AssertInputString(data.userId, 40)) {
                    return;
                }

                if (usersSet.UserById(data.userId) != null) {
                    socket.disconnect();
                }

                var name = data.userName;
                id = data.userId;
                var added = usersSet.AddUser(id, name, segmentsSet);

                socket.emit('infoUpdate', {
                    team: added.team,
                    gameState: {
                        val: 'choosePlayer'
                    }
                });
                loginUpdater = setTimeout(function() {
                    socket.disconnect();
                }, 15000);
            });

            roundUpdater = setInterval(
                function() {
                    if (id == null) {
                        return;
                    }
                    var user = usersSet.UserById(id);
                    if (roundId != socketTeamsUpdateId) {
                        socket.emit('infoUpdate', {
                            team: user.team,
                            gameState: {
                                val: 'choosePlayer'
                            }
                        });
                        socketTeamsUpdateId = roundId;
                        if (updater) {
                            clearInterval(updater);
                            updater = null;
                        }
                        if (loginUpdater) {
                            clearTimeout(loginUpdater);
                        }
                        loginUpdater = setTimeout(function() {
                            socket.disconnect();
                        }, 15000);
                    }
                }, 20
            );

            socket.on('playerType', function(data) {
                if (!data) {
                    return;
                }
                if (!AssertInputInteger(data.playerType, 0, 4)) {
                    return;
                }
                clearTimeout(loginUpdater);
                usersSet.SetPlayerType(id, data.playerType);
                usersSet.UpdatePosition(id, segmentsSet);
                var user = usersSet.UserById(id);
                if (usersSet.HaveTeams()) {
                    gameState.val = 'game';
                }
                socket.emit('infoUpdate', {
                    user: user,
                    segments: segmentsSet.GetMaze(),
                    usersInfoList: usersSet.GetInfoList(),
                    gameState: {
                        val: gameState.val,
                        timeRemaining: gameState.timeRemaining
                    }
                });
                socket.broadcast.emit('infoUpdate', {
                    usersInfoList: usersSet.GetInfoList(),
                    gameState: {
                        val: gameState.val,
                        timeRemaining: gameState.timeRemaining
                    }
                });

                if (updater != null) {
                    clearInterval(updater);
                }
                updater = setInterval(
                    function() {
                        var user = usersSet.UserById(id);
                        socket.emit('infoUpdate', {
                            user: user,
                            closePlayersList: usersSet.GetClosePlayersList(id, segmentsSet),
                            farPlayersList: usersSet.GetFarPlayersList(id),
                            gameState: {
                                timeRemaining: gameState.timeRemaining
                            }
                        });
                    },
                    50
                )
            });

            socket.on('changeDirection', function(data) {
                if (!data) {
                    return;
                }
                if (!AssertInputDouble(data.dx, -100000, 100000)) {
                    return;
                }
                if (!AssertInputDouble(data.dy, -100000, 100000)) {
                    return;
                }

                var user = usersSet.UserById(id);
                user.dx = data.dx;
                user.dy = data.dy;
            });
            socket.on('speedUpOn', function(data) {
                var user = usersSet.UserById(id);
                user.speedUpOn = true;
            });
            socket.on('speedUpOff', function(data) {
                var user = usersSet.UserById(id);
                user.speedUpOn = false;
            });
            socket.on('xRay', function(data) {
                var user = usersSet.UserById(id);
                if (user.boostSize >= user.xRayNeed && !user.xRayOn) {
                    user.boostSize -= user.xRayNeed;
                    user.xRayOn = true;
                    setTimeout(function() {
                        user.xRayOn = false;
                    }, 1000);
                }
            });
            socket.on('shot', function(data) {
                if (!data) {
                    return;
                }
                if (!AssertInputDouble(data.x, -100000, 100000)) {
                    return;
                }
                if (!AssertInputDouble(data.y, -100000, 100000)) {
                    return;
                }
                var user = usersSet.UserById(id);
                if (user.boostSize >= user.shotNeed) {
                    user.boostSize -= user.shotNeed;
                    segmentsSet.Shot(data.x, data.y, user.shotRadius);
                    socket.emit('infoUpdate', {
                        segments: segmentsSet.GetMaze()
                    });
                    socket.broadcast.emit('infoUpdate', {
                        segments: segmentsSet.GetMaze(),
                        shotPosition: {
                            x: data.x,
                            y: data.y,
                            r: user.shotRadius
                        }
                    });
                }
            });

            socket.on('disconnect', function(data) {
                if (id == null) {
                    return;
                }
                usersSet.RemoveUser(id);
                io.emit('infoUpdate', {
                    usersInfoList: usersSet.GetInfoList()
                });
                clearInterval(updater);
                clearInterval(roundUpdater);
                if (loginUpdater) {
                    clearTimeout(loginUpdater);
                }
                CheckEnd();
            });
        });

        setInterval(function() {
            var users = usersSet.GetList();
            users.forEach(function(user) {
                if (user.playerType == null) {
                    return;
                }

                var coof = 1;
                if (user.speedUpOn && user.boostSize > 0.05) {
                    user.boostSize -= 0.05;
                    coof = 3;
                }
                var addX = 0;
                var addY = 0;
                var uDist = user.dx * user.dx + user.dy * user.dy;
                if (uDist > user.radius * user.radius) {
                    addX = user.dx / Math.sqrt(uDist) * user.speed * 0.05 * coof;
                    addY = user.dy / Math.sqrt(uDist) * user.speed * 0.05 * coof;
                }

                segmentsSet.TryMoving(user, addX, 0);
                segmentsSet.TryMoving(user, 0, addY);

                user.boostSize = Math.min(user.boostSize + user.boostIncPerSec * 0.05, user.maxBoost);
            });
            var teamsChanged = false;
            users.forEach(function(user1) {
                if (user1.playerType == null) {
                    return;
                }
                users.forEach(function(user2) {
                    if (user2.playerType == null) {
                        return;
                    }
                    if ((user1.team + 2) % 3 == user2.team) {
                        var dist = Math.pow(
                            (user1.x - user2.x) * (user1.x - user2.x)+
                            (user1.y - user2.y) * (user1.y - user2.y),
                            0.5);
                        if (dist * 1.2 <= user1.innerRadius + user2.innerRadius) {
                            teamsChanged = true;
                            user2.team = user1.team;
                            user2.boostSize = 0;
                            user1.scorePlus += 2;
                            user2.scoreMinus += 2;
                        }
                    }
                });
            });
            if (gameState.val == 'game') {
                gameState.timeRemaining -= 0.05;
                if (gameState.timeRemaining <= 0) {
                    CheckEnd(true);
                }
            }
            if (teamsChanged) {
                io.emit('infoUpdate', {
                    usersInfoList: usersSet.GetInfoList()
                });
                CheckEnd();
            }
        }, 50);
    }
};