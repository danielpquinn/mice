var socket = io.connect('http://localhost'),
    players = [];
socket.on('player connect', function(data) { 
    console.log(data.id + ' connected');
    for(var i = 0; i < data.players.length; i++) {
      if(!players[i]) {
        var newSphere = mice.createSphere();
        var newPlayer = {
          id: data.players[i].id,
          body: newSphere
        }
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
    for( var i = 0; i < players.length; i++) {
      if(players[i].id === data.id) {
        mice.scene.removeChild(players[i].body);
        players.splice(i, 1);
      }
    }
});
socket.on('game update', function(data) {
    console.log('game updated');
    console.log(data.players);
    console.log(players);
    for(var i = 0; i < data.players.length; i++) {
      players[i].body.position.x = data.players[i].x;
      players[i].body.position.y = data.players[i].y;
      players[i].body.position.z = data.players[i].z;
    }
});
jQuery(document).ready(function() {
    mice.init();
}); //mice object
var mice = {};
mice.init = function() {
    mice.container = document.getElementById('container');
    mice.camera = new THREE.FirstPersonCamera( {
  
  		fov: 50, aspect: window.innerWidth / window.innerHeight, near: 1, far: 20000,
  		constrainVertical: true, verticalMin: 1.1, verticalMax: 2.2,
  		movementSpeed: 1000, lookSpeed: 0.125, noFly: false, lookVertical: true, autoForward: false
  
  	} );
  	mice.camera.target.position.z = - 100;
    mice.scene = new THREE.Scene();
  	mice.scene.fog = new THREE.FogExp2( 0xffffff, 0.00015 );
    mice.webglRenderer = new THREE.WebGLRenderer();
    mice.createScene();
    mice.animate();
} // Setup scene
mice.createScene = function() {
    mice.camera = new THREE.Camera(70, window.innerWidth / window.innerHeight, 1, 1000);
    mice.camera.position.y = 150;
    mice.camera.position.z = 500;
    mice.camera.target.position.y = 150; // create a point light
    directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.x = 200;
    directionalLight.position.y = 400;
    directionalLight.position.z = 200;
    directionalLight.position.normalize();
    mice.scene.addLight(directionalLight);
    mice.webglRenderer.setSize(window.innerWidth, window.innerHeight);
    mice.container.appendChild(mice.webglRenderer.domElement);
}
mice.createSphere = function() {
    // create the sphere's material
    var sphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xCC0000
    });
    // set up the sphere vars
    var radius = 50,
        segments = 16,
        rings = 16;
    // create a new mesh with sphere geometry -
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
    return sphere;
}
//Keyboard Events!
$(document).keydown(function(e) {
    switch (e.keyCode) {
    case 37:
        e.preventDefault();
        mice.leftPressed = true;
        socket.emit('keydown', {
            keypressed: 'left'
        });
        break;
    case 38:
        e.preventDefault();
        mice.upPressed = true;
        socket.emit('keydown', {
            keypressed: 'up'
        });
        break;
    case 39:
        e.preventDefault();
        mice.rightPressed = true;
        socket.emit('keydown', {
            keypressed: 'right'
        });
        break;
    case 40:
        e.preventDefault();
        mice.downPressed = true;
        socket.emit('keydown', {
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
        socket.emit('keyup', {
            keylifted: 'left'
        });
        break;
    case 38:
        e.preventDefault();
        mice.upPressed = false;
        socket.emit('keyup', {
            keylifted: 'up'
        });
        break;
    case 39:
        e.preventDefault();
        mice.rightPressed = false;
        socket.emit('keyup', {
            keylifted: 'right'
        });
        break;
    case 40:
        e.preventDefault();
        mice.downPressed = false;
        socket.emit('keyup', {
            keylifted: 'down'
        });
        break;
    }
});

mice.animate = function() {
  requestAnimationFrame( mice.animate );
  mice.webglRenderer.render(mice.scene, mice.camera);
}
