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
   title: 'CodeCollab',
   code: codeToCollab
  });
});

app.listen(3000);

// socket I/O functionality

var sessions = [],
    history = [],
    docVersion = 0;

io.sockets.on('connection', function(socket){
  socket.emit('nickname?', {});
  socket.on('nickname', function(data){
    data = (data===null)? randomString() : data;
    socket.emit('version', {version: docVersion, text: codeToCollab});
    socket.emit('members', sessions);
    io.sockets.emit('join', {name: data, msg: data+' has joined the session'});
    socket.set('nickname', data);
    sessions.push(data);
  });
  socket.on('chat', function(data){
    socket.get('nickname', function(err, nickname){
      io.sockets.emit('chat', nickname+': '+data);
    });
  });
  socket.on('disconnect', function(){
    socket.get('nickname', function(err, nickname){
      io.sockets.emit('quit', {name: nickname, msg: nickname+' has quit the session'});
      sessions.splice(sessions.indexOf(nickname), 1);
    });
  });
  socket.on('edit', function(data){
    tmp = {cursor: data.cursor, len: (data.edit.length - data.sbstr.length)}
    for(i=docVersion-data.version-1; i>=0; i--) {
      if(tmp.cursor >= history[i].cursor)
        tmp.cursor += history[i].len;
    }
    data.cursor = tmp.cursor;
    if(data.edit=='\b') {
      codeToCollab = codeToCollab.substr(0,data.cursor-1) + codeToCollab.substr(data.cursor);
    } else {
      codeToCollab = codeToCollab.substr(0,data.cursor-1) + data.edit + codeToCollab.substr(data.cursor);
    }
    docVersion += 1;
    history.push(tmp);
    io.sockets.emit('edit', data);
  });
});

// Some useful functions

function randomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

var codeToCollab = "var express = require('express');\n\nvar app = module.exports = express.createServer();\n\nvar io = require('socket.io').listen(app);\n\n// Configuration\napp.configure('development', function(){\n  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); \n});\n\napp.configure('production', function(){\n  app.use(express.errorHandler()); \n});\n\n// Routes\n\napp.get('/', function(req, res){\n  res.render('index', {\n    title: 'CodeCollab'\n  });\n});\n\napp.get('/new', function(req, res){\n  res.redirect('/code/' + randomString());\n});\n\napp.get('/join', function(req, res){\n  var id = req.param('id', '');\n  if(id=='')\n    res.redirect('/');\n  else\n    res.redirect('/code/' + id);\n});\n\napp.get('/code/:id', function(req, res){\n  res.render('code', {\n   title: 'CodeCollab',\n   code: codeToCollab\n  });\n});\n\napp.listen(3000);\n"
