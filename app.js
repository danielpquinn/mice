// create app Object
var app = {
    players: [],
    express: 0,
    server: 0,
    io: 0
};
app.init = function() { // init app properties    
    this.players = [];
    this.express = require('express');
    this.server = this.express.createServer();
    this.io = require('socket.io').listen(this.server); // create local references to properties
    var express = this.express,
        server = this.server,
        io = this.io
    server.listen(8000); // configure server
    server.configure(function() {
        server.set('views', __dirname + '/views');
        server.set('view engine', 'jade');
        server.use(express.bodyParser());
        server.use(express.methodOverride());
        server.use(server.router);
        server.use(express.static(__dirname + '/public'));
    }); // add development configuration
    server.configure('development', function() {
        server.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    }); // add production configuration
    server.configure('production', function() {
        server.use(express.errorHandler());
    }); // set up routes
    server.get('/', function(req, res) {
        res.render('index', {
            title: 'Mice'
        });
    }); // add server event listeners
    io.sockets.on('connection', function(socket) { // get unique player id
        var id = socket.id;
        newPlayer = app.createPlayer(id);
        app.players.push(newPlayer);
        console.log(app.players);
        io.sockets.emit('player connect', {
            id: id,
            players: app.players
        });
        socket.emit('assign id', {
          id: id
        });
        socket.on('keydown', function(data) {
            console.log(data);
            app.onKeyDown(id, data);
            io.sockets.emit('game event', {
              players: app.players
            });
        });
        socket.on('keyup', function(data) {
            app.onKeyUp(id, data);
            io.sockets.emit('game event', {
              players: app.players
            });
        });
        setInterval(function(){
            io.sockets.emit('game sync', {
              players: app.players
            });
        }, 10000);
        socket.on('disconnect', function() {
            console.log(app.players);
            for (var i = 0, max = app.players.length; i < max; i++) {
                console.log(app.players[i]);
                if (app.players[i].id === id) {
                    app.players.splice(i, 1);
                    break;
                }
            }
            io.sockets.emit('player disconnect', {
                id: id,
                players: app.players
            });
        });
    });
    this.gameLoop();
}
app.createPlayer = function(id) {
    player = {
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
        keysPressed: [],
        id: id
    };
    return player;
}
app.onKeyDown = function(id, data) {
    for (var i = 0, max = app.players.length; i < max; i++) {
        if (app.players[i].id === id) {
            console.log(app.players[i].keysPressed);
            app.players[i].keysPressed = data.keysPressed;
        }
    }
}
app.onKeyUp = function(id, data) {
    for (var i = 0, max = app.players.length; i < max; i++) {
        if (app.players[i].id === id) {
            app.players[i].keysPressed = data.keysPressed;
        }
    }
}
Array.prototype.inArray = function(value) {
  for(var i = 0, max = this.length; i < max; i++) {
    if(this[i] === value) {
      return true;
    }
  }
  return false;
}
app.updatePlayers = function() {
    var currPlayer;
    for (var i = 0, max = app.players.length; i < max; i++) {
        currPlayer = app.players[i];
        if (currPlayer.keysPressed.inArray(37)) {
            currPlayer.rotation += 0.1;
        }
        if (currPlayer.keysPressed.inArray(39)) {
            currPlayer.rotation -= 0.1;
        }
        if (currPlayer.keysPressed.inArray(38)) {
            currPlayer.x -= Math.sin(currPlayer.rotation) * 10;
            currPlayer.z -= Math.cos(currPlayer.rotation) * 10;
        }
        if (currPlayer.keysPressed.inArray(40)) {
            currPlayer.x += Math.sin(currPlayer.rotation) * 10;
            currPlayer.z += Math.cos(currPlayer.rotation) * 10;
        }
    }
}
app.gameLoop = function() {
  app.updatePlayers();
}
app.init();
setInterval(function(){
  app.gameLoop();
}, 50);
