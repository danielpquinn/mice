var mice = {
    players: [],
    socket: io.connect('http://localhost')
};
mice.init = function() {
    var socket = this.socket,
        players = this.players;
    socket.on('player connect', function(data) {
        console.log(data.id + ' connected');
        for (var i = 0, max = data.players.length; i < max; i++) {
            if (!players[i]) {
                var newPlayer = mice.createPlayer();
                players.push(newPlayer);
                newPlayer.body.position.x = data.players[i].x;
                newPlayer.body.position.y = data.players[i].y;
                newPlayer.body.position.z = data.players[i].z;
                mice.scene.addChild(newPlayer.body);
            }
        }
    });
    socket.on('player disconnect', function(data) {
        console.log(data.id + ' disconnected');
        for (var i = 0, max = players.length; i < max; i++) {
            if (players[i].id === data.id) {
                mice.scene.removeChild(players[i].body);
                players.splice(i, 1);
            }
        }
    });
    socket.on('game sync', function(data) {
        for (var i = 0, max = data.players.length; i < max; i++) {
            players[i].body.position.x = data.players[i].x;
            players[i].body.position.y = data.players[i].y;
            players[i].body.position.z = data.players[i].z;           
        }
    });
    socket.on('game event', function(data) {
        for (var i = 0, max = data.players.length; i < max; i++) {
            players[i].leftPressed = data.players[i].leftPressed;
            players[i].rightPressed = data.players[i].rightPressed;
            players[i].upPressed = data.players[i].upPressed;
            players[i].downPressed = data.players[i].downPressed;            
        }
    });
    this.container = document.getElementById('container');
    this.camera = new THREE.FirstPersonCamera({
        fov: 50,
        aspect: window.innerWidth / window.innerHeight,
        near: 1,
        far: 20000,
        constrainVertical: true,
        verticalMin: 1.1,
        verticalMax: 2.2,
        movementSpeed: 1000,
        lookSpeed: 0.125,
        noFly: false,
        lookVertical: true,
        autoForward: false
    });
    this.camera.target.position.z = -100;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.00015);
    this.webglRenderer = new THREE.WebGLRenderer();
    this.createScene();
    this.gameLoop();
}
mice.createPlayer = function(id) {
    var newSphere = mice.createSphere();
    player = {
        x: 0,
        y: 0,
        z: 0,
        leftPressed: false,
        rightPressed: false,
        upPressed: false,
        downPressed: false,
        id: id,
        body: newSphere
    };
    return player;
} // Setup scene
mice.createScene = function() {
    this.camera = new THREE.Camera(70, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.y = 150;
    this.camera.position.z = 500;
    this.camera.target.position.y = 150; // create a point light
    directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.x = 200;
    directionalLight.position.y = 400;
    directionalLight.position.z = 200;
    directionalLight.position.normalize();
    this.scene.addLight(directionalLight);
    this.webglRenderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(mice.webglRenderer.domElement);
}
mice.createSphere = function() { // create the sphere's material
    var sphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xCC0000
    }); // set up the sphere vars
    var radius = 50,
        segments = 16,
        rings = 16; // create a new mesh with sphere geometry -
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
    return sphere;
} //Keyboard Events!
$(document).keydown(function(e) {
    switch (e.keyCode) {
    case 37:
        e.preventDefault();
        mice.leftPressed = true;
        mice.socket.emit('keydown', {
            keypressed: 'left'
        });
        break;
    case 38:
        e.preventDefault();
        mice.upPressed = true;
        mice.socket.emit('keydown', {
            keypressed: 'up'
        });
        break;
    case 39:
        e.preventDefault();
        mice.rightPressed = true;
        mice.socket.emit('keydown', {
            keypressed: 'right'
        });
        break;
    case 40:
        e.preventDefault();
        mice.downPressed = true;
        mice.socket.emit('keydown', {
            keypressed: 'down'
        });
        break;
    }
});
$(document).keyup(function(e) {
    switch (e.keyCode) {
    case 37:
        e.preventDefault();
        mice.leftPressed = false;
        mice.socket.emit('keyup', {
            keylifted: 'left'
        });
        break;
    case 38:
        e.preventDefault();
        mice.upPressed = false;
        mice.socket.emit('keyup', {
            keylifted: 'up'
        });
        break;
    case 39:
        e.preventDefault();
        mice.rightPressed = false;
        mice.socket.emit('keyup', {
            keylifted: 'right'
        });
        break;
    case 40:
        e.preventDefault();
        mice.downPressed = false;
        mice.socket.emit('keyup', {
            keylifted: 'down'
        });
        break;
    }
});
mice.updatePlayers = function() {
    var currPlayer;
    for (var i = 0, max = mice.players.length; i < max; i++) {
        currPlayer = mice.players[i];
        if (currPlayer.leftPressed) {
          currPlayer.body.position.x -= 10;
        }
        if (currPlayer.rightPressed) {
            currPlayer.body.position.x += 10;
        }
        if (currPlayer.upPressed) {
            currPlayer.body.position.y += 10;
        }
        if (currPlayer.downPressed) {
          currPlayer.body.position.y -= 10;
        }
    }
}
mice.gameLoop = function() {
  mice.updatePlayers();
  mice.webglRenderer.render(mice.scene, mice.camera);
}
jQuery(document).ready(function() {
    mice.init();  
    setInterval(function(){
      mice.gameLoop();
    }, 50);
});
