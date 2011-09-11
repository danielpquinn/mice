var express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    players = [],
    tid;
app.listen(8000); // Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});
app.configure('development', function() {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});
app.configure('production', function() {
    app.use(express.errorHandler());
}); // Routes
app.get('/', function(req, res) {
    res.render('index', {
        title: 'Mice'
    });
});
io.sockets.on('connection', function(socket) {

    var id = socket.id;
    newPlayer = createPlayer(id);
    players.push(newPlayer);
    io.sockets.emit('player connect', {
        id: id,
        players: players
    });
    
    socket.on('keydown', function(data) {
      updatePlayers(id, data);
    });
    
    socket.on('disconnect', function() {
        io.sockets.emit('player disconnect', {
            id: id,
            players: players
        });
        for( var i = 0; i < players.length; i++) {
          if(players[i].id === id) {
            players.splice(i, 1);
          }
        }
    });
    
});

// Do the timer!

gameLoop = function() {
  io.sockets.emit('game update', { players: players });
  tid = setTimeout(function() {gameLoop()}, 2000);
}

gameLoop();

updatePlayers = function(id, data) {
  console.log(data.id + ' pressed ' + data.keypressed);
  for( var i = 0; i < players.length; i++) {
    if(players[i].id === id) {
      switch(data.keypressed) {
        case 'left':
          players[i].x -= 10;
          break;
        case 'right':
          players[i].x += 10;
          break;
        case 'up':
          players[i].z += 10;
          break;
        case 'down':
          players[i].z -= 10;
          break;
      }
    }
  }
}

createPlayer = function(id) {
  player = {
    x: 0,
    y: 0,
    z: 0,
    id: id
  };
  return player;
}