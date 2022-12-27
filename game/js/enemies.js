;(function() {
    var enemiesPool = [];
    
    window.enemiesPool = {
        getEnemy: function() {
            var enemy;
            
            if (enemiesPool.length == 0) {
                return {
                    position: [0, 0],
                    sprite: new Sprite("game/images/qbert.png", [0, 16], [16, 16], 5, [0, 1])
                };   
            } else {
                var enemy = enemiesPool.pop();
                enemy.position = [0, 0];
                return enemy;
            }
        },
        removeEnemy: function(enemies, i) {
            enemiesPool.push(enemies[i]);
            enemies.splice(i, 1);
        },
        getPoolLength: function() {
            return enemiesPool.length;
        }
    };
})();
