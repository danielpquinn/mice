var socket = io.connect('http://localhost'),
  id;
socket.on('player connect', function(data) {
    console.log('player connected');
    console.log(data.players);
});
socket.on('player disconnect', function(data) {
    console.log('player disconnected');
    console.log(data.players);
});
socket.on('player keydown', function(data) {
    console.log(data.id + ' pressed ' + data.keypressed);
});
jQuery(document).ready(function() {
    scene = mice.createScene();
});
var mice = {};
mice.createScene = function() {
    var container, camera, scene, webglRenderer;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var mesh, mesh_R_eye, mesh_L_eye;

    function init() {
        // Setup the container that the simulation will happen in
        container = document.getElementById('container');
        camera = new THREE.Camera(70, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.y = 150;
        camera.position.z = 500;
        camera.target.position.y = 150;
        // Setup scene
        scene = new THREE.Scene();
        // Setup Group
        group = new THREE.Object3D();
        // create a point light
        directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.x = 200;
        directionalLight.position.y = 400;
        directionalLight.position.z = 200;
        directionalLight.position.normalize();
        scene.addLight(directionalLight);
    }
    function initRenderer() {
        webglRenderer = new THREE.WebGLRenderer();
        webglRenderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(webglRenderer.domElement);
    }
    init();
    initRenderer();
    webglRenderer.render(scene, camera);
}

$(document).keydown(function(e) {
    switch(e.keyCode) {
      case 37:
      e.preventDefault();
        socket.emit('keydown', { keypressed: 'left' });
        break;
      case 38:
      e.preventDefault();
        socket.emit('keydown', { keypressed: 'up' });
        break;
      case 39:
      e.preventDefault();
        socket.emit('keydown', { keypressed: 'right' });
        break;
      case 40:
      e.preventDefault();
        socket.emit('keydown', { keypressed: 'down' });
        break;
    }
});
