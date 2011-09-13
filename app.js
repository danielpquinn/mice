// create app Object
var app = {
    players: [],
    express: 0,
    server: 0,
    io: 0,
    tid: 0
};
app.init = function() { // init app properties    
    this.players = [];
    this.express = require('express');
    this.server = this.express.createServer();
    this.io = require('socket.io').listen(this.server); // create local references to properties
    var express = this.express,
        server = this.server,
        io = this.io,
        tid = this.tid; // listen on 8000
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
        io.sockets.emit('player connect', {
            id: id,
            players: app.players
        });
        socket.on('keydown', function(data) {
            app.onKeyDown(id, data);
            app.updatePlayers();
            io.sockets.emit('game update', {
                players: app.players
            });
        });
        socket.on('keyup', function(data) {
            app.onKeyUp(id, data);
        });
        socket.on('disconnect', function() {
            io.sockets.emit('player disconnect', {
                id: id,
                players: app.players
            });
            for (var i = 0, max = app.players.length; i < max; i++) {
                if (app.players[i].id === id) {
                    app.players.splice(i, 1);
                }
            }
        });
    });
}
app.createPlayer = function(id) {
    player = {
        x: 0,
        y: 0,
        z: 0,
        leftPressed: false,
        rightPressed: false,
        upPressed: false,
        downPressed: false,
        id: id
    };
    return player;
}
app.onKeyDown = function(id, data) {
    console.log(id + ' pressed ' + data.keypressed);
    for (var i = 0, max = app.players.length; i < max; i++) {
        if (app.players[i].id === id) {
            switch (data.keypressed) {
            case 'left':
                app.players[i].leftPressed = true;
                break;
            case 'right':
                app.players[i].rightPressed = true;
                break;
            case 'up':
                app.players[i].upPressed = true;
                break;
            case 'down':
                app.players[i].downPressed = true;
                break;
            }
        }
    }
}
app.onKeyUp = function(id, data) {
    console.log(id + ' lifted ' + data.keylifted);
    for (var i = 0, max = app.players.length; i < max; i++) {
        if (app.players[i].id === id) {
            switch (data.keylifted) {
            case 'left':
                app.players[i].leftPressed = false;
                break;
            case 'right':
                app.players[i].rightPressed = false;
                break;
            case 'up':
                app.players[i].upPressed = false;
                break;
            case 'down':
                app.players[i].downPressed = false;
                break;
            }
        }
    }
}
app.updatePlayers = function() {
    for (var i = 0, max = app.players.length; i < max; i++) {
        if (app.players[i].leftPressed) {
            app.players[i].x -= 10;
        }
        if (app.players[i].rightPressed) {
            app.players[i].x += 10;
        }
        if (app.players[i].upPressed) {
            app.players[i].y += 10;
        }
        if (app.players[i].downPressed) {
            app.players[i].y -= 10;
        }
    }
}
app.init();
