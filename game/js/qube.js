;(function() {
    function Qube(x, y, z, position, isVisited) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.position = position;        
        this.isVisited = isVisited || false;
    }

    Qube.prototype.toString = function qubeToString() {
        return `(${this.x},${this.y}) -> pos: [${this.position}], visited: ${this.isVisited}`;
    };
    
    window.Qube = Qube;
})();
