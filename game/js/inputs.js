;(function () {
    var pressedKeys = {};
    
    function setKey(event, status) {
        var code = event.keyCode;
        var key;
        
        switch (code) {
            case 32:
                key = "SPACE";
                break;
            case 37: // left
                key = "Q";
                break;
            case 38: // up
                key = "W";
                break;
            case 39: // right
                key = "S";
                break;
            case 40: // down
                key = "A";
                break;
            default:
                key = String.fromCharCode(code);
        }
        
        pressedKeys[key] = status;
    }
    
    document.addEventListener("keydown", function(e) {
        setKey(e, true);
    });
    
    document.addEventListener("keyup", function(e) {
        setKey(e, false);
    });
    
    window.addEventListener("blur", function() {
        pressedKeys = {};
    });
    
    window.input = {
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        }
    };
})();
