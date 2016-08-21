var Point = function(x, y) {
    this.x = x;
    this.y = y;
};
var Segment = function(p1, p2) {
    this.p1 = new Point(p1.x, p1.y);
    this.p2 = new Point(p2.x, p2.y);
};

module.exports = {
    Set: function() {
        var segments = [];
        var Width = 3600;
        var Height = 1800;
        var CrossesSize = 100;
        var HoleSize = 100;
        this.Width = Width;
        this.Height = Height;

        var Intersects = function(a, b, c, d) {
            var areaCalc = function(a, b, c) {
                return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
            };

            var intersectProjections = function(a, b, c, d) {
                return Math.max(Math.min(a, b), Math.min(c, d)) <= Math.min(Math.max(a, b), Math.max(c, d));
            };

            return intersectProjections (a.x, b.x, c.x, d.x)
                    && intersectProjections(a.y, b.y, c.y, d.y)
                    && areaCalc(a,b,c) * areaCalc(a,b,d) <= 0
                    && areaCalc(c,d,a) * areaCalc(c,d,b) <= 0;
        };

        var AddSegment = function(p1, p2) {
            if (p1.x > p2.x) {
                var swp = p1.x;
                p1.x = p2.x;
                p2.x = swp;
            }
            if (p1.y > p2.y) {
                var swp = p1.y;
                p1.y = p2.y;
                p2.y = swp;
            }
            segments.push(
                new Segment(
                    p1,
                    p2
                )
            );
        };

        var AddCross = function(center, size) {
            AddSegment(
                new Point(center.x - size, center.y),
                new Point(center.x + size, center.y)
            );
            AddSegment(
                new Point(center.x, center.y - size),
                new Point(center.x, center.y + size)
            );
        };

        this.Generate = function() {
            segments
            // sides begin
            AddSegment(
                new Point(0, 0),
                new Point(Width, 0)
            );
            AddSegment(
                new Point(Width, 0),
                new Point(Width, Height)
            );
            AddSegment(
                new Point(0, Height),
                new Point(Width, Height)
            );
            AddSegment(
                new Point(0, 0),
                new Point(0, Height)
            );
            // sides end

            var pnt;

            // top left
            pnt = new Point(Width / 4, Height / 4);
            AddCross(pnt, CrossesSize);
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y - Height / 8),
                new Point(pnt.x + Width / 8, pnt.y - Height / 8)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y - Height / 8),
                new Point(pnt.x - Width / 8, pnt.y + Height / 8)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y + Height / 8),
                new Point(pnt.x + HoleSize / 2, pnt.y + Height / 8)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y + Height / 8),
                new Point(pnt.x + Width / 8, pnt.y + HoleSize / 2)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y - Height / 8),
                new Point(pnt.x + Width / 8, pnt.y - HoleSize / 2)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y + Height / 8),
                new Point(pnt.x - HoleSize / 2, pnt.y + Height / 8)
            );


            // top right
            pnt = new Point(Width - Width / 4, Height / 4);
            AddCross(pnt, CrossesSize);
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y - Height / 8),
                new Point(pnt.x - Width / 8, pnt.y - Height / 8)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y - Height / 8),
                new Point(pnt.x + Width / 8, pnt.y + Height / 8)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y + Height / 8),
                new Point(pnt.x - HoleSize / 2, pnt.y + Height / 8)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y + Height / 8),
                new Point(pnt.x - Width / 8, pnt.y + HoleSize / 2)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y - Height / 8),
                new Point(pnt.x - Width / 8, pnt.y - HoleSize / 2)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y + Height / 8),
                new Point(pnt.x + HoleSize / 2, pnt.y + Height / 8)
            );

            // bottom left
            pnt = new Point(Width / 4, Height - Height / 4);
            AddCross(pnt, CrossesSize);
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y + Height / 8),
                new Point(pnt.x + Width / 8, pnt.y + Height / 8)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y - Height / 8),
                new Point(pnt.x - Width / 8, pnt.y + Height / 8)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y - Height / 8),
                new Point(pnt.x + HoleSize / 2, pnt.y - Height / 8)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y - Height / 8),
                new Point(pnt.x + Width / 8, pnt.y - HoleSize / 2)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y + Height / 8),
                new Point(pnt.x + Width / 8, pnt.y + HoleSize / 2)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y - Height / 8),
                new Point(pnt.x - HoleSize / 2, pnt.y - Height / 8)
            );


            // bottom right
            pnt = new Point(Width - Width / 4, Height - Height / 4);
            AddCross(pnt, CrossesSize);
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y + Height / 8),
                new Point(pnt.x - Width / 8, pnt.y + Height / 8)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y - Height / 8),
                new Point(pnt.x + Width / 8, pnt.y + Height / 8)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y - Height / 8),
                new Point(pnt.x - HoleSize / 2, pnt.y - Height / 8)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y - Height / 8),
                new Point(pnt.x - Width / 8, pnt.y - HoleSize / 2)
            );
            AddSegment(
                new Point(pnt.x - Width / 8, pnt.y + Height / 8),
                new Point(pnt.x - Width / 8, pnt.y + HoleSize / 2)
            );
            AddSegment(
                new Point(pnt.x + Width / 8, pnt.y - Height / 8),
                new Point(pnt.x + HoleSize / 2, pnt.y - Height / 8)
            );

            // central cross
            pnt = new Point(Width / 2, Height / 2);
            AddCross(pnt, CrossesSize * 4);
            AddSegment(
                new Point(pnt.x - CrossesSize * 2, pnt.y - CrossesSize * 2),
                new Point(pnt.x - CrossesSize * 2, pnt.y - CrossesSize)
            );
            AddSegment(
                new Point(pnt.x - CrossesSize * 2, pnt.y - CrossesSize * 2),
                new Point(pnt.x - CrossesSize, pnt.y - CrossesSize * 2)
            );

            AddSegment(
                new Point(pnt.x + CrossesSize * 2, pnt.y - CrossesSize * 2),
                new Point(pnt.x + CrossesSize * 2, pnt.y - CrossesSize)
            );
            AddSegment(
                new Point(pnt.x + CrossesSize * 2, pnt.y - CrossesSize * 2),
                new Point(pnt.x + CrossesSize, pnt.y - CrossesSize * 2)
            );

            AddSegment(
                new Point(pnt.x - CrossesSize * 2, pnt.y + CrossesSize * 2),
                new Point(pnt.x - CrossesSize * 2, pnt.y + CrossesSize)
            );
            AddSegment(
                new Point(pnt.x - CrossesSize * 2, pnt.y + CrossesSize * 2),
                new Point(pnt.x - CrossesSize, pnt.y + CrossesSize * 2)
            );

            AddSegment(
                new Point(pnt.x + CrossesSize * 2, pnt.y + CrossesSize * 2),
                new Point(pnt.x + CrossesSize * 2, pnt.y + CrossesSize)
            );
            AddSegment(
                new Point(pnt.x + CrossesSize * 2, pnt.y + CrossesSize * 2),
                new Point(pnt.x + CrossesSize, pnt.y + CrossesSize * 2)
            );
        };

        this.Shot = function(x, y, r) {
            var newSegments = [];
            segments.forEach(function(segment) {
                if (segment.p1.x == segment.p2.x) {
                    if (segment.p1.x == 0 || segment.p1.x == Width) {
                        newSegments.push(segment);
                        return;
                    }
                    var dist = Math.abs(segment.p1.x - x);
                    if (dist >= r) {
                        newSegments.push(segment);
                        return;
                    }
                    var a = 1;
                    var b = - 2 * y;
                    var c = y * y - r * r + dist * dist;
                    var d = b * b - 4 * a * c;
                    var y1 = Math.round((-b - Math.sqrt(d)) / (2 * a));
                    var y2 = Math.round((-b + Math.sqrt(d)) / (2 * a));
                    if (y1 > y2) {
                        var swp = y1;
                        y1 = y2;
                        y2 = swp;
                    }

                    if (y2 <= segment.p1.y || segment.p2.y <= y1) {
                        newSegments.push(segment);
                        return;
                    }

                    if (y1 <= segment.p1.y && segment.p2.y <= y2) {
                        return;
                    }

                    if (y1 <= segment.p1.y) {
                        segment.p1.y = y2;
                        newSegments.push(segment);
                        return;
                    }
                    if (segment.p2.y <= y2) {
                        segment.p2.y = y1;
                        newSegments.push(segment);
                        return;
                    }

                    var segmentCopy = new Segment(segment.p1, segment.p2);
                    segment.p2.y = y1;
                    segmentCopy.p1.y = y2;
                    newSegments.push(segment);
                    newSegments.push(segmentCopy);
                } else {
                    if (segment.p1.y == 0 || segment.p1.y == Height) {
                        newSegments.push(segment);
                        return;
                    }
                    var dist = Math.abs(segment.p1.y - y);
                    if (dist >= r) {
                        newSegments.push(segment);
                        return;
                    }
                    var a = 1;
                    var b = - 2 * x;
                    var c = x * x - r * r + dist * dist;
                    var d = b * b - 4 * a * c;
                    var x1 = Math.round((-b - Math.sqrt(d)) / (2 * a));
                    var x2 = Math.round((-b + Math.sqrt(d)) / (2 * a));
                    if (x1 > x2) {
                        var swp = x1;
                        x1 = x2;
                        x2 = swp;
                    }

                    if (x2 <= segment.p1.x || segment.p2.x <= x1) {
                        newSegments.push(segment);
                        return;
                    }

                    if (x1 <= segment.p1.x && segment.p2.x <= x2) {
                        return;
                    }

                    if (x1 <= segment.p1.x) {
                        segment.p1.x = x2;
                        newSegments.push(segment);
                        return;
                    }
                    if (segment.p2.x <= x2) {
                        segment.p2.x = x1;
                        newSegments.push(segment);
                        return;
                    }

                    var segmentCopy = new Segment(segment.p1, segment.p2);
                    segment.p2.x = x1;
                    segmentCopy.p1.x = x2;
                    newSegments.push(segment);
                    newSegments.push(segmentCopy);
                }
            });
            segments = newSegments;
        };

        this.TryMoving = function(user, addX, addY) {
            var x = user.x + addX;
            var y = user.y + addY;
            var r = user.innerRadius;
            var can = true;

            segments.forEach(function(segment) {
                if (segment.p1.x == segment.p2.x) {
                    var dist = Math.abs(segment.p1.x - x);
                    if (dist >= r) {
                        return;
                    }
                    var a = 1;
                    var b = - 2 * y;
                    var c = y * y - r * r + dist * dist;
                    var d = b * b - 4 * a * c;
                    var y1 = Math.round((-b - Math.sqrt(d)) / (2 * a));
                    var y2 = Math.round((-b + Math.sqrt(d)) / (2 * a));
                    if (y1 > y2) {
                        var swp = y1;
                        y1 = y2;
                        y2 = swp;
                    }

                    if (y2 <= segment.p1.y || segment.p2.y <= y1) {
                        return;
                    }
                    can = false;
                } else {
                    var dist = Math.abs(segment.p1.y - y);
                    if (dist >= r) {
                        return;
                    }
                    var a = 1;
                    var b = - 2 * x;
                    var c = x * x - r * r + dist * dist;
                    var d = b * b - 4 * a * c;
                    var x1 = Math.round((-b - Math.sqrt(d)) / (2 * a));
                    var x2 = Math.round((-b + Math.sqrt(d)) / (2 * a));
                    if (x1 > x2) {
                        var swp = x1;
                        x1 = x2;
                        x2 = swp;
                    }

                    if (x2 <= segment.p1.x || segment.p2.x <= x1) {
                        return;
                    }
                    can = false;
                }
            });

            if (can) {
                user.x = x;
                user.y = y;
                return true;
            }
            return false;
        };

        this.Intersects = function(x1, y1, x2, y2) {
            var found = false;
            if (x1 == x2 && y1 == y2) {
                return false;
            }
            segments.forEach(function(segment) {
                if (!found && Intersects(segment.p1, segment.p2, {x: x1, y: y1}, {x: x2, y: y2})) {
                    found = true;
                    return;
                }
            });

            return found;
        };

        this.GetMaze = function() {
            return segments;
        };
    }
};