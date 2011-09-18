var socket = io.connect(window.location.origin);
var members = [];

updateMembers = function() {
  var e = $('.members')[0];
  var r = members[0];
  for(i=1;i<members.length;i++)
    r += "\n"+members[i];
  e.innerHTML = r;
}

putChat = function(msg) {
  var e = $('.chatbox')[0];
  e.innerHTML = e.innerHTML+msg+"\n";
}

sendChat = function() {
  var e = $('.chat')[0];
  socket.emit('chat', e.value);
  e.value = '';
}

key_handler = function (key) {
	console.log('{'+cpos+','+ver+','+substr+','+e+'}');
	socket.emit('text edit', {cursor:cpos, version:ver, substring:substr, edit:e});
}

socket.on('text edit', function (data){
	console.log('text-edit: '+data);
	var text = acee.getValue();
	text = text.substr(0,data.cpos-1) + data.edit + text.substr(data.cpos -1 + data.edit.length);
	ver += 1;
	acee.setValue(text);
});

socket.on('nickname?', function(data){
	var nickname = prompt('Your nickname?');
	socket.emit('nickname', nickname);
	socket.on('members', function(data){
	  members = data;
	  updateMembers();
	});
	socket.on('join', function(data){
	  members.push(data.name);
    updateMembers();
    putChat(data.msg);
	});
	socket.on('quit', function(data){
	  members.splice(members.indexOf(data.name), 1);
	  updateMembers();
	  putChat(data.msg);
	});
  socket.on('chat', function(data){
  	putChat(data);
  });
});
