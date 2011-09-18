/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'CodeCollab'
  });
});

app.get('/new', function(req, res){
  res.redirect('/code/' + randomString());
});

app.get('/join', function(req, res){
  var id = req.param('id', '');
  if(id=='')
    res.redirect('/');
  else
    res.redirect('/code/' + id);
});

app.get('/code/:id', function(req, res){
  res.render('code', {
   title: 'CodeCollab'
  });
});

// socket I/O functionality

var sessions = [];

io.sockets.on('connection', function(socket){
	socket.emit('nickname?', {});
	socket.on('nickname', function(data){
	  console.log(data, 'joined the session');
    socket.emit('members', sessions);
	  io.sockets.emit('join', {name: data, msg: data+' has joined the session'});
	  socket.set('nickname', data);
	  sessions.push(data);
	});
	socket.on('chat', function(data){
	  socket.get('nickname', function(err, nickname){
  		console.log("msg from", nickname, ":", data);
  		io.sockets.emit('chat', nickname+': '+data);
	  });
	});
	socket.on('disconnect', function(){
	  socket.get('nickname', function(err, nickname){	    
  	  console.log(nickname, 'quit the session');
  	  io.sockets.emit('quit', {name: nickname, msg: nickname+' has quit the session'});
  	  sessions.splice(sessions.indexOf(nickname), 1);
	  });
	});
})

// Start listening to server

app.listen(3000);

// Some useful functions

function randomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
