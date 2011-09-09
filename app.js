var express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    players = [];
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
    id = socket.id;
    players.push(id);
    io.sockets.emit('player connect', {
        id: id
    });
    socket.on('keydown', function(data) {
        io.sockets.emit('player keydown', {
            keypressed: data.keypressed,
            id: socket.id
        });
    });
    socket.on('disconnect', function(id) {
        players.splice(players.indexOf(id), 1);
        io.sockets.emit('player disconnect', {
            id: id
        });
    });
});
