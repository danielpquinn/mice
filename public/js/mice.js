var mice = {
    players: [],
    socket: io.connect('http://localhost'),
    keysPressed: []
};
mice.init = function() {
    var socket = this.socket,
        players = this.players;
    socket.on('player connect', function(data) {
        for (var i = 0, max = data.players.length; i < max; i++) {
            if (!players[i]) {
                var newPlayer = mice.createPlayer();
                newPlayer.body = mice.createSphere();
                newPlayer.id = data.players[i].id;
                newPlayer.body.position.x = data.players[i].x;
                newPlayer.body.position.z = data.players[i].z;
                newPlayer.body.position.rotation = data.players[i].rotation;
                players.push(newPlayer);
                mice.scene.addChild(newPlayer.body);
            }
        }
        console.log(players);
        console.log(data.players); 
    });
    socket.on('assign id', function(data) {
        console.log('assign id: ' + data.id);
        for (var i = 0, max = players.length; i < max; i++) {
          if(players[i].id === data.id) {
            players[i].isme = true;
          }
        }
    });
    socket.on('player disconnect', function(data) {
        console.log(data.id + ' disconnected');
        for (var i = 0, max = players.length; i < max; i++) {
            if (players[i].id === data.id) {
                mice.scene.removeChild(players[i].body);
                players.splice(i, 1);
                break;
            }
        }
    });
    socket.on('game sync', function(data) {
        for (var i = 0, max = data.players.length; i < max; i++) {
            players[i].body.position.x = data.players[i].x;
            players[i].body.position.z = data.players[i].z;
            players[i].body.position.rotation = data.players[i].rotation;
        }
    });
    socket.on('game event', function(data) {
        for (var i = 0, max = data.players.length; i < max; i++) {
            players[i].keysPressed = data.players[i].keysPressed;
        }
    });
    this.container = document.getElementById('container');
    this.scene = new THREE.Scene();
    this.webglRenderer = new THREE.WebGLRenderer();
    this.createScene();
    this.gameLoop();
}
mice.createPlayer = function(id) {
    var newCube = mice.createSphere();
    player = {
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
        keysPressed: [],
        id: id,
        body: 0,
        isme: false
    };
    return player;
} // Setup scene
mice.createScene = function() {
    var floor,
        cube;
    this.camera = new THREE.Camera(70, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.useTarget = false;
    this.camera.position.y = 10;
    directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.x = 50;
    directionalLight.position.y = 500;
    directionalLight.position.z = 500;
    directionalLight.position.normalize();
    mice.cube = this.createCube();
    mice.floor = this.createFloor();
    this.scene.addChild(mice.cube);
    this.scene.addChild(mice.floor);
    this.scene.addLight(directionalLight);
    this.webglRenderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
    this.container.appendChild(mice.webglRenderer.domElement);
}
mice.createSphere = function() { // create the sphere's material
    var redMaterial = new THREE.MeshLambertMaterial({
        color: 0x333333
    }); // set up the sphere vars
    var radius = 20,
        segments = 16,
        rings = 16; // create a new mesh with sphere geometry -
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), redMaterial);
    return sphere;
} //Keyboard Events!
mice.createFloor = function() {
    var redMaterial = new THREE.MeshLambertMaterial({
        color: 0x333333
    });
    floor = new THREE.Mesh( new THREE.CubeGeometry( 500, 10, 500 ), redMaterial);
    floor.position.y = -50;
    return floor;
}
mice.createCube = function() {
    cube = new THREE.Mesh( new THREE.CubeGeometry( 20, 2000, 20 ), new THREE.MeshNormalMaterial() );
    return cube;
}
$(document).keydown(function(e) {
    e.preventDefault();
    if(mice.keysPressed.indexOf(e.keyCode) === -1) {
      mice.keysPressed.push(e.keyCode);
      mice.socket.emit('keydown', {
        keysPressed: mice.keysPressed
      });
    }
});
$(document).keyup(function(e) {
    e.preventDefault();
    mice.keysPressed.splice(mice.keysPressed.indexOf(e.keyCode), 1);
    mice.socket.emit('keyup', {
      keysPressed: mice.keysPressed
    });
});
Array.prototype.inArray = function(value) {
  for(var i = 0, max = this.length; i < max; i++) {
    if(this[i] === value) {
      return true;
    }
  }
  return false;
}
mice.updatePlayers = function() {
    var currPlayer;
    for (var i = 0, max = mice.players.length; i < max; i++) {
        currPlayer = mice.players[i];
        if (currPlayer.keysPressed.inArray(37)) {
            currPlayer.rotation += 0.1;
        }
        if (currPlayer.keysPressed.inArray(39)) {
            currPlayer.rotation -= 0.1;
        }
        if (currPlayer.keysPressed.inArray(38)) {
            currPlayer.body.position.x -= Math.sin(currPlayer.rotation) * 10;
            currPlayer.body.position.z -= Math.cos(currPlayer.rotation) * 10;
        }
        if (currPlayer.keysPressed.inArray(40)) {
            currPlayer.body.position.x += Math.sin(currPlayer.rotation) * 10;
            currPlayer.body.position.z += Math.cos(currPlayer.rotation) * 10;
        }
        currPlayer.body.rotation.y = currPlayer.rotation;
        if (currPlayer.isme) {
          mice.camera.rotation.y = currPlayer.rotation;
          mice.camera.rotation.y = currPlayer.rotation;
          mice.camera.position.x = currPlayer.body.position.x;
          mice.camera.position.z = currPlayer.body.position.z;
        }
    }
    mice.cube.rotation.y += 0.01;
}
mice.gameLoop = function() {
  mice.updatePlayers();
  mice.webglRenderer.render(mice.scene, mice.camera);
}
jQuery(document).ready(function() {
    $('#container').css({
      'width': document.innerWidth - 20 + 'px',
      'height': document.innerHeight - 20 + 'px'
    });
    mice.init();
    setInterval(function(){
      mice.gameLoop();
    }, 50);
});
