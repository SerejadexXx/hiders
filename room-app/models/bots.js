module.exports = {
    CreateBot: function(id) {
        var _id = id;
        this.GetId = function() {
            return _id;
        };
        var lastDir = {x: 1, y: 0};
        var ApplyVector = function(user, dx, dy, speedUpMult) {
            var d = Math.sqrt(dx * dx + dy * dy);
            user.x += dx / d * speedUpMult * 0.05 * user.speed;
            user.y += dy / d * speedUpMult * 0.05 * user.speed;
        };
        var ApplyBorders = function(point, radius, segments) {
            if (point.x < radius) {
                point.x = radius;
            }
            if (point.x > segments.Width - radius) {
                point.x = segments.Width - radius;
            }
            if (point.y < radius) {
                point.y = radius;
            }
            if (point.y > segments.Height - radius) {
                point.y = segments.Height - radius;
            }
            return point;
        };
        var dist = function(x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        };
        var DistToCloseBorder = function(x, y, radius, segments) {
            var d = 5 * radius;
            d = Math.min(d, dist(x, y, 0, 0));
            d = Math.min(d, dist(x, y, segments.Width, 0));
            d = Math.min(d, dist(x, y, 0, segments.Height));
            d = Math.min(d, dist(x, y, segments.Width, segments.Height));
        };

        var CalcPointPowerByClose = function(px, py, x, y, radius, team, closeUsers, segments) {
            var power = 0;
            closeUsers.forEach(function(user) {
                if (user.team == team) {
                    return;
                }
                var d1 = Math.sqrt((px - user.x) * (px - user.x) + (py - user.y) * (py - user.y));
                var d2 = Math.sqrt((x - user.x) * (x - user.x) + (y - user.y) * (y - user.y));


                if ((team + 2) % 3 == user.team) {
                    if (d1 > d2) {
                        if (DistToCloseBorder(px, py, radius, segments) > DistToCloseBorder(x, y, radius, segments)) {
                            power += (d1 - d2) * 1.1 / d1;
                        } else {
                            power += (d1 - d2) / d1;
                        }
                    }
                } else {
                    if (DistToCloseBorder(px, py, radius, segments) > DistToCloseBorder(x, y, radius, segments)) {
                        if (d2 < d1) {
                            power += (d2 - d1) * 2.2 / d1;
                        } else {
                            power += (d2 - d1) * 2.1 / d1;
                        }
                    } else {
                        power += (d2 - d1) * 2 / d1;
                    }
                }
            });
            return power;
        };

        var AngleDiff = function(a1, a2) {
            if (a1 < 0) {
                a1 += Math.PI * 2;
            }
            if (a2 < 0) {
                a2 += Math.PI * 2;
            }
            if (a1 > a2) {
                var c = a1;
                a1 = a2;
                a2 = c;
            }
            return Math.min(a2 - a1, a1 + Math.PI * 2 - a2);
        };
        var CalcPointPowerByFar = function(angle, team, farUsers, lastDir) {
            var angle2 = Math.atan2(lastDir.dy, lastDir.dx);

            var power = (Math.PI * 2 - AngleDiff(angle, angle2)) / 10000;

            farUsers.forEach(function(user) {
                if (user.team == team) {
                    return;
                }
                if ((team + 2) % 3 == user.team) {
                    power += (Math.PI * 2 - AngleDiff(angle, user.angleDeg / 180 * Math.PI)) / 1500;
                } else {
                    power -= (Math.PI * 2 - AngleDiff(angle, user.angleDeg / 180 * Math.PI)) / 1000;
                    //console.log(angle + " " + user.angleDeg / 180 * Math.PI + " " + AngleDiff(angle, user.angleDeg / 180 * Math.PI));
                }
            });
            return power;
        };

        this.Iterate = function(user, closeUsers, farUsers, segments, shot) {
            var ret = {
                dx: user.radius + 1,
                dy: 0,
                speedUp: 0
            };

            var Power = -1000000000;

            for (var speedUp = 0; speedUp < 2; speedUp++) {
                if (speedUp == 1) {
                    if (user.boostSize < 0.05) {
                        break;
                    }
                }
                for (var angle = 0; angle < Math.PI * 2; angle += Math.PI / 91) {
                    var coordinates = {
                        x: user.x,
                        y: user.y,
                        speed: user.speed
                    };
                    var dx = Math.cos(angle) * (user.radius + 1);
                    var dy = Math.sin(angle) * (user.radius + 1);

                    ApplyVector(
                        coordinates,
                        dx, dy,
                        speedUp ? user.speedUpMult : 1
                    );
                    ApplyBorders(coordinates, user.radius, segments);
                    var tempPower = CalcPointPowerByClose(
                        user.x, user.y,
                        coordinates.x, coordinates.y,
                        user.radius,
                        user.team,
                        closeUsers,
                        segments
                    );
                    tempPower += CalcPointPowerByFar(
                        angle,
                        user.team,
                        farUsers,
                        lastDir
                    );

                    if (DistToCloseBorder(coordinates.x, coordinates.y, user.radius, segments) >
                        DistToCloseBorder(user.x, user.y, user.radius, segments)) {
                        tempPower -= 0.001;
                    }

                    if (speedUp) {
                        tempPower -= 0.001;
                    }

                    if (tempPower > Power) {
                        Power = tempPower;
                        ret = {
                            dx: dx,
                            dy: dy,
                            speedUp: speedUp
                        };
                    }
                }
            }
            var endUser = {
                x: user.x,
                y: user.y,
                innerRadius: user.innerRadius,
                speed: user.speed
            };
            ApplyVector(
                endUser,
                ret.dx, ret.dy,
                ret.speedUp ? user.speedUpMult : 1
            );

            ApplyBorders(
                endUser,
                user.radius,
                segments
            );

            /*if (id == '1231231231231311313jkjkdjg0') {
             console.log(endUser.x + " " + endUser.y + " " + user.x + " " + user.y);
             }*/
            if (!segments.TryMoving(endUser, 0, 0)) {
                shot(user.x, user.y);
            }

            user.dx = ret.dx;
            user.dy = ret.dy;
            user.speedUpOn = ret.speedUp ? true : false;
            lastDir = JSON.parse(JSON.stringify(ret));
            return ret;
        };
    }
};