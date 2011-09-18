
var EDITOR_PORT=3001

var version = 0,
io = require('socket.io').listen(EDITOR_PORT);

class Data {
	var cursor;
	var edit;
};

var history = new Array();
Data temp;

io.sockets('connection', socketHandler);

function socketHandler(socket) {
	socket.on('text edit', function(data){
		temp.cursor = data.cursor;
		temp.edit = len(data.edit)-len(data.substring);
		for(int i=version-data.version-1; i>=0; i--) {
			if(temp.cursor >= history[i].cursor){
				temp.cursor += history[i].edit;
			}
		}

		data.cursor = temp.cursor;
		history.push(temp);
		io.sockets.emit('text edit', data);
	});
};
