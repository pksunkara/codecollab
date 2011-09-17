
var CHAT_PORT = 3000

var 
io = require('socket.io').listen(CHAT_PORT),

io.sockets.on('connection', socketHandler)

function socketHandler(socket){
	socket.emit('asking name', {msg:'What\'s your name?'});
	
	socket.on('giving name', function(data){
		io.sockets.emit('message', {name:'GOD', msg:data.name + ' has joined the session'});
		socket.set('name', data.name)
	});

	socket.on('message', function(data){
		console.log("recieved a message from", data.from, "saying", data.msg);
		io.sockets.emit('message', {name:socket.get('name'), msg:data.msg});
	});

	socket.on('disconnect', function() {
		io.sockets.emit('message', {name:'GOD', msg:socket.get('name')+' has left the editing session'});
	});
}

