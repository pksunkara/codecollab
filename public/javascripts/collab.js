var socket = io.connect(window.location.origin);
var members = [];

updateMembers = function() {
  var e = document.getElementsByClassName('members')[0];
  var r = members[0];
  for(i=1;i<members.length;i++)
    r += "\n"+members[i];
  e.innerHTML = r;
}

putChat = function(msg) {
  var e = document.getElementsByClassName('chatbox')[0];
  e.innerHTML = e.innerHTML+msg+"\n";
}

sendChat = function() {
  var e = document.getElementsByClassName('chat')[0];
  socket.emit('chat', e.value);
  e.value = '';
}

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
