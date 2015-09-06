function point(x,y) {
    this.x = x;
    this.y = y;
    this.plus = function(that) {
        return new point(this.x+that.x, this.y+that.y);
    }
    this.minus = function(that) {
        return new point(this.x-that.x, this.y-that.y);
    }
    this.neg = function () {
        return new point(-this.x, -this.y);
    }
    this.mul = function (t) {
        return new point(t*this.x, t*this.y);
    }
    this.norm = function () {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    this.unit = function () {
        return this.mul(1/this.norm());
    }
    this.join = function (that) {
        return new line( -this.y + that.y
                       , this.x - that.x
                       , this.x*that.y - this.y*that.x
                       );
    }
    this.rot90 = function () {
        return new point(this.y, -this.x);
    }
    this.angle = function() {
        return Math.atan2(this.y, this.x);
    }
}
function line(a,b,c) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.meet = function (that) {
        var d = this.a*that.b - this.b*that.a
        return new point( (this.c*that.b - this.b*that.c)/d
                        , (this.a*that.c - this.c*that.a)/d
                        );
    }
    this.perp = function (pt) {
        return new line(-this.b, this.a, -this.b*pt.x+this.a*pt.y);
    }
}
function perpbisect(a,b) {
    return a.join(b).perp(midpt(a,b));
}
function circle(x,y,r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.centre = function() {
        return new point(this.x, this.y);
    }
    this.polar = function(ang) {
        return new point(this.x + this.r*Math.cos(ang), this.y + this.r*Math.sin(ang));
    }
    this.meetcircle = function(that) {
        var odiff = that.centre().minus(this.centre());
        var d = odiff.norm();
        if (d == 0) return [];
        var xlen = (d + (this.r*this.r - that.r*that.r)/d)/2;
        var ylensq = this.r*this.r - xlen*xlen;
        if (ylensq < 0) return [];
        var ylen = Math.sqrt(ylensq);
        var xdir = odiff.unit();
        var ypart = xdir.rot90().mul(ylen);
        var m = this.centre().plus(xdir.mul(xlen));
        return [m.plus(ypart), m.minus(ypart)];
    }
}
function circumcircle(a,b,c) {
    var centre = perpbisect(a,b).meet(perpbisect(b,c));
    return new circle(centre.x, centre.y, centre.minus(a).norm());
}
function angle(a,b,c) {
    var ang = b.minus(c).angle() - b.minus(a).angle();
    if (ang < -Math.PI)
        ang += 2*Math.PI;
    else if (ang > Math.PI)
        ang -= 2*Math.PI;
    return ang;
}
var deg = Math.PI/180
var rad = 1/deg

function midpt(a, b) { return a.plus(b).mul(0.5); }
function transl(v) { return "translate(" + v.x + "," + v.y + ")" }
function rotate(ang) { return "rotate(" + ang*rad + ")"; }
function rot180(pt) { return transl(pt) + "scale(-1,-1)" + transl(pt.mul(-1)); }
function glide(pt1, img1, pt2, img2) {
    var a1 = midpt(pt1, img1);
    var a2 = midpt(pt2, img2);
    var axis = a1.join(a2);
    var v = img1.minus(axis.perp(pt1).meet(axis).mul(2).minus(pt1));
    return transl(a1)
         + rotate(a2.minus(a1).angle())
         + "scale(1,-1)"
         + rotate(-a2.minus(a1).angle())
         + transl(a1.mul(-1))
         + transl(v);
}
function pointsAttr(pts) {
    return pts.map(function (pt) { return pt.x + "," + pt.y; }).join(" ");
}

function clip(lo, hi, x) { return Math.max(lo, Math.min(x, hi)); }
