var socket = io.connect('http://localhost'),
    players = [];
socket.on('player connect', function(data) {
    console.log(data.id + ' connected');
    mice.sphere = mice.createSphere();
    mice.scene.addChild(mice.sphere);
});
socket.on('player disconnect', function(data) {
    console.log(data.id + ' disconnected');
});
socket.on('player keydown', function(data) {
    console.log('player ' + data.id + ' pressed ' + data.keypressed);
});
jQuery(document).ready(function() {
    mice.init();
}); //mice object
var mice = {};
mice.init = function() {
    mice.container = document.getElementById('container');
    mice.camera = new THREE.Camera(70, window.innerWidth / window.innerHeight, 1, 1000);
    mice.scene = new THREE.Scene();
    mice.webglRenderer = new THREE.WebGLRenderer();
    mice.createScene();
    mice.tid = setTimeout(function(){mice.loop()}, 100);
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

mice.loop = function() {
    if(mice.leftPressed){mice.camera.position.x += 100}
    if(mice.rightPressed){mice.camera.position.x -= 100}
    mice.webglRenderer.render(mice.scene, mice.camera);
    mice.tid = setTimeout(function(){mice.loop()}, 100);
}
