var socket = io.connect(window.location.origin);
var members = [];

var docVersion = 0,
    noNeed = [37, 38, 39, 40],
    sel = '';

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

getCursor = function() {
  cursor = acee.getCursorPosition();
  linem1 = cursor.row;
  column = cursor.column;
  text = acee.getSession().getValue().split("\n");
  pos = 0;
  for(i=0;i<linem1;i++) {
    pos += text[i].length+1;
  }
  return pos+column;
}

setCursor = function(val) {
  var text = acee.getSession().getValue();
  var linem1 = 0;
  var column = 0;
  for(i=0;i<val;i++) {
    if(text[i]=="\n") {
      linem1++;
      column = 0;
    } else
      column++;
  }
  acee.gotoLine(linem1+1);
  for(i=0; i<=column; i++) {
    acee.selection.moveCursorRight();
  }
}

key_handler = function (event) {
  var key = event.which || event.keyCode;
  if(noNeed.indexOf(key)==-1 && !(event.altKey || event.ctrlKey)) {
    var cpos = getCursor();
    socket.emit('edit', {cursor: cpos, version: docVersion, sbstr: sel, edit: String.fromCharCode(key)});
    return false;
  }
}


socket.on('edit', function (data){
  var text = acee.getSession().getValue();
  var currentCursor = getCursor();
  if(data.d.edit == '\b') {
    text = text.substr(0,data.d.cursor-1) + text.substr(data.d.cursor);
  } else {
    text = text.substr(0,data.d.cursor) + data.d.edit + text.substr(data.d.cursor);
  }

  docVersion += 1;
  acee.getSession().setValue(text);

  socket.get('nickname', function(err, nickame){
    if(data.n == nickname){
      setCursor(data.d.cursor);
    } else {
      setCursor(currentCursor);
    }
  });
});

socket.on('version', function(data){
  version = data.version;
  acee.getSession().setValue(data.text);
});

socket.on('nickname?', function(data){
  var nickname = prompt('Your nickname?');
  socket.emit('nickname', nickname);
  socket.set('nickname', nickname);
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
