var User = function(id, name, start, groupId, team) {
    this.id = id;
    this.name = name;
    this.groupId = groupId;
    this.team = team;
    this.dx = 0;
    this.dy = 0;
    this.x = start.x;
    this.y = start.y;
    this.speed = 100;
    this.speedUpMult = 3;
    this.boostSize = 3;
    this.speedUpOn = false;
    this.xRayOn = false;
    this.scorePlus = 0;
    this.scoreMinus = 0;
    this.boostIncPerSec = 0.15;
    this.radius = 40;
    this.shotRadius = 80;
    this.innerRadius = 40;
    this.visionSize = 350;
    this.farDistance = 700;
    this.xRayNeed = 1;
    this.shotNeed = 1;
    this.maxBoost = 1;
    this.playerType = null;
};

function GetRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Stats = [
    {
        xRayNeed: 0,
        shotNeed: 3,
        boostIncPerSec: 0.15,
        maxBoost: 3,
        boostSize: 1,
        speed: 100,
        speedUpMult: 3
    },
    {
        xRayNeed: 3,
        shotNeed: 0,
        boostIncPerSec: 0.15,
        maxBoost: 3,
        boostSize: 1,
        speed: 100,
        speedUpMult: 3
    },
    {
        xRayNeed: 1,
        shotNeed: 1,
        boostIncPerSec: 0.15,
        maxBoost: 3,
        boostSize: 2,
        speed: 100,
        speedUpMult: 3
    },
    {
        xRayNeed: 4,
        shotNeed: 4,
        boostIncPerSec: 0.15,
        maxBoost: 4,
        boostSize: 4,
        speed: 100,
        speedUpMult: 3
    },
    {
        xRayNeed: 2,
        shotNeed: 2,
        boostIncPerSec: 0.15,
        maxBoost: 1,
        boostSize: 1,
        speed: 125,
        speedUpMult: 4
    }
];

module.exports = {
    Set: function() {
        var users = [];

        var GetSmallestTeam = function() {
            var quantity = [0, 0, 0];
            users.forEach(function(user) {
                quantity[user.team]++;
            });
            var team = 0;
            quantity.forEach(function(val, key) {
               if (quantity[team] > val) {
                   team = key;
               }
            });
            return team;
        };

        var GetSmallestGroupId = function() {
            var groupId = 0;
            while (users.filter(function(user){
                    return user.groupId == groupId;
                }).length > 0) {
                groupId++;
            }
            return groupId;
        };

        var GetStartPoint = function(segmentsSet, team) {
            var best = null;
            var bestDist = 0;
            var INF = 1000000000;
            for (var it = 0; it < 100 || !best; it++ ) {
                var temp = {
                    x: Math.round(Math.random() * segmentsSet.Width),
                    y: Math.round(Math.random() * segmentsSet.Height),
                    innerRadius: 60
                };
                if (segmentsSet.TryMoving(temp, 0, 0)) {
                    var tempDist = INF;
                    users.forEach(function(user) {
                        if (user.playerType == null) {
                            return;
                        }
                        if (user.team == team) {
                            return;
                        }
                        var distToUser = (user.x - temp.x) * (user.x - temp.x) +
                            (user.y - temp.y) * (user.y - temp.y);
                        tempDist = Math.min(tempDist, distToUser);
                    });
                    if (tempDist == INF) {
                        bestDist = tempDist;
                        best = temp;
                        break;
                    }

                    if (tempDist > bestDist && tempDist < 800 * 800) {
                        bestDist = tempDist;
                        best = temp;
                    }
                }
            }
            return {
                x: best.x,
                y: best.y
            };
        };

        this.AddUser = function(id, name, segmentsSet) {
            var team = GetSmallestTeam();
            var added = new User(
                id,
                name,
                GetStartPoint(segmentsSet, team),
                GetSmallestGroupId(),
                team
            );
            users.push(added);
            return added;
        };
        this.RemoveUser = function(id) {
            users = users.filter(function(user) {
               return user.id != id;
            });
        };
        this.GetActive = function() {
            return users.length;
        };
        this.GetInfoList = function() {
            return users.map(function(user) {
                return {
                    name: user.name,
                    groupId: user.groupId,
                    team: user.team,
                    scorePlus: user.scorePlus,
                    scoreMinus: user.scoreMinus,
                    radius: user.radius,
                    playerType: user.playerType
                };
            });
        };
        this.GetList = function() {
            return users;
        };
        this.UserById = function(id) {
            return users.filter(function(user) {
                return user.id == id;
            })[0];
        };

        this.SetPlayerType = function(id, playerType) {
            var user =  users.filter(function(user) {
                return user.id == id;
            })[0];
            if (user) {
                user.playerType = playerType;
                user.xRayNeed = Stats[playerType].xRayNeed;
                user.shotNeed = Stats[playerType].shotNeed;
                user.boostIncPerSec = Stats[playerType].boostIncPerSec;
                user.maxBoost = Stats[playerType].maxBoost;
                user.speed = Stats[playerType].speed;
                user.speedUpMult = Stats[playerType].speedUpMult;
                user.boostSize = Stats[playerType].boostSize;
            }
        };

        this.UpdatePosition = function(id, segmentsSet) {
            var user = users.filter(function(user) {
                return user.id == id;
            })[0];
            var startPoint = GetStartPoint(segmentsSet, user.team);
            user.x = startPoint.x;
            user.y = startPoint.y;
        };

        var CheckVisibility = function(user1, user2, segmentsSet) {
            var dx = user2.x - user1.x;
            var dy = user2.y - user1.y;
            var dist = Math.pow(
                dx * dx + dy * dy,
                0.5
            );
            if (dist <= user2.radius) {
                return true;
            }
            var cDist = Math.pow(
                dist * dist - user2.radius * user2.radius,
                0.5
            );
            var angle = Math.atan2(dy, dx);
            var cAngle = Math.atan2(user2.radius, cDist);
            var foundCover = false;
            var angle1 = angle - cAngle;
            var angle2 = angle + cAngle;
            while (angle2 >= 2 * Math.PI) {
                angle1 -= 2 * Math.PI;
                angle2 -= 2 * Math.PI;
            }
            var maxAngle = {
                val: angle1,
                func: Math.max
            };
            var minAngle = {
                val: angle2,
                func: Math.min
            };

            // check for cover by one interval
            segmentsSet.GetMaze().forEach(function (segment) {
                if (segmentsSet.IntersectsIntervals(
                        segment.p1,
                        segment.p2,
                        {
                            x: user1.x,
                            y: user1.y
                        },
                        {
                            x: user1.x + cDist * Math.cos(angle - cAngle),
                            y: user1.y + cDist * Math.sin(angle - cAngle)
                        }
                    ) &&
                    segmentsSet.IntersectsIntervals(
                        segment.p1,
                        segment.p2,
                        {
                            x: user1.x,
                            y: user1.y
                        },
                        {
                            x: user1.x + cDist * Math.cos(angle + cAngle),
                            y: user1.y + cDist * Math.sin(angle + cAngle)
                        }
                    )) {
                    foundCover = true;
                }
            });
            if (foundCover) {
                return false;
            }

            // try combining intervals
            // because of structure of the maze we don't count parts that are completely inside angle

            // left side intersections
            var UpdateAngle = function (goalAngle, cAngle) {
                segmentsSet.GetMaze().forEach(function (segment) {
                    if (segmentsSet.IntersectsIntervals(
                            segment.p1,
                            segment.p2,
                            {
                                x: user1.x,
                                y: user1.y
                            },
                            {
                                x: user1.x + cDist * Math.cos(angle + cAngle),
                                y: user1.y + cDist * Math.sin(angle + cAngle)
                            }
                        )) {
                        var dx = segment.p1.x - user1.x;
                        var dy = segment.p1.y - user1.y;
                        var curAngle = Math.atan2(dy, dx);
                        if (angle1 <= curAngle && curAngle <= angle2) {
                            goalAngle.val = goalAngle.func(curAngle, goalAngle.val);
                        }
                        curAngle -= 2 * Math.PI;
                        if (angle1 <= curAngle && curAngle <= angle2) {
                            goalAngle.val = goalAngle.func(curAngle, goalAngle.val);
                        }

                        dx = segment.p2.x - user1.x;
                        dy = segment.p2.y - user1.y;
                        curAngle = Math.atan2(dy, dx);
                        if (angle1 <= curAngle && curAngle <= angle2) {
                            goalAngle.val = goalAngle.func(curAngle, goalAngle.val);
                        }
                        curAngle -= 2 * Math.PI;
                        if (angle1 <= curAngle && curAngle <= angle2) {
                            goalAngle.val = goalAngle.func(curAngle, goalAngle.val);
                        }
                    }
                });
            };
            UpdateAngle(maxAngle, -cAngle);
            UpdateAngle(minAngle, cAngle);
            return (maxAngle.val < minAngle.val);
        };

        this.GetClosePlayersList = function(id, segmentsSet) {
            var user = users.filter(function(user) {
                return user.id == id;
            })[0];
            if (!user) {
                return [];
            }

            var rez = [];
            users.forEach(function(curUser) {
                if (curUser.playerType == null) {
                    return;
                }
                if (curUser.groupId == user.groupId) {
                    return;
                }
                if (
                    (user.xRayOn && curUser.playerType != 2) ||
                    ((user.x - curUser.x) * (user.x - curUser.x) +
                    (user.y - curUser.y) * (user.y - curUser.y) <= user.visionSize * user.visionSize
                    && CheckVisibility(user, curUser, segmentsSet))
                    //!segmentsSet.Intersects(user.x, user.y, curUser.x, curUser.y))
                ) {
                    rez.push({
                        x: curUser.x,
                        y: curUser.y,
                        groupId: curUser.groupId
                    });
                }
            });
            return rez;
        };
        this.GetFarPlayersList = function(id) {
            var user = users.filter(function(user) {
                return user.id == id;
            })[0];
            if (!user) {
                return [];
            }

            var rez = [];
            users.forEach(function(curUser) {
                if (curUser.playerType == null) {
                    return;
                }
                if (curUser.groupId == user.groupId) {
                    return;
                }
                if (
                    (user.x - curUser.x) * (user.x - curUser.x) +
                    (user.y - curUser.y) * (user.y - curUser.y) >= user.farDistance * user.farDistance
                //!segmentsSet.Intersects(user.x, user.y, curUser.x, curUser.y))
                ) {
                    rez.push({
                        angleDeg: Math.round(18000 * Math.atan2(curUser.y - user.y, curUser.x - user.x) / Math.PI) / 100,
                        groupId: curUser.groupId
                    });
                }
            });
            var rezFiltered = [];
            rez.sort(function(a, b) {
                return a.angleDeg - b.angleDeg;
            }).forEach(function(val) {
                if (rezFiltered.length == 0) {
                    rezFiltered.push(val);
                    return;
                }
                if (rezFiltered[rezFiltered.length - 1].angleDeg + 5 > val.angleDeg) {
                    return;
                }
                rezFiltered.push(val);
            });

            return rez;
        };
        this.HaveTeams = function() {
            var teams = [0, 0, 0];
            users.forEach(function(user) {
                if (user.playerType != null) {
                    teams[user.team]++;
                }
            });
            return (teams[0] >= 1 && teams[1] >= 1 && teams[2] >= 1);
        };
        this.HaveWinner = function() {
            var teams = [0, 0, 0];
            users.forEach(function(user) {
                if (user.playerType != null) {
                    teams[user.team]++;
                }
            });
            if (teams[0] == 0) {
                return 1;
            }
            if (teams[1] == 0) {
                return 2;
            }
            if (teams[2] == 0) {
                return 0;
            }
            return -1;
        };
        this.GetLeadingTeam = function() {
            var teams = [0, 0, 0];
            users.forEach(function(user) {
                if (user.playerType != null) {
                    teams[user.team]++;
                }
            });
            var leading = 0;
            teams.forEach(function(val, key) {
                if (val > teams[leading]) {
                    leading = key;
                }
            });
            return leading;
        };
        this.UpdateData = function() {
            var teams = [
                Math.floor(users.length / 3 + 0.001),
                Math.floor(users.length / 3 + 0.001),
                Math.floor(users.length / 3 + 0.001)
            ];
            var last = -1;
            while (teams[0] + teams[1] + teams[2] != users.length) {
                var x = GetRandomInt(0, 2);
                while (x == last) {
                    x = GetRandomInt(0, 2);
                }
                teams[x]++;
                last = x;
            }
            users.forEach(function(user) {
                user.team = GetRandomInt(0, 2);
                while (teams[user.team] == 0) {
                    user.team = GetRandomInt(0, 2);
                }
                teams[user.team]--;
                user.playerType = null;
                user.dx = 0;
                user.dy = 0;
                user.speedUpOn = false;
                user.xRayOn = false;
            });
        };
    }
};