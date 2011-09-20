var socket = io.connect(window.location.origin);
var members = [];
var nickname = '';
var aceEditorditor = null;

var docVersion = 0,
    noNeed = [37, 38, 39, 40],
    selectedText = '';

window.onload = function() {
  aceEditor = ace.edit("editor");
  aceEditor.setTheme("ace/theme/twilight");

  var JavaScriptMode = require("ace/mode/javascript").Mode;
  aceEditor.getSession().setMode(new JavaScriptMode());
}

updateMembers = function() {
  $('.members')[0].innerHTML = members.join("\n");
}

putChat = function(msg) {
  var element = $('.chatbox')[0];
  element.innerHTML = element.innerHTML+msg+"\n";
}

sendChat = function() {
  var element = $('.chat')[0];
  socket.emit('chat', element.value);
  element.value = '';
}

getCursor = function() {
  cursor = aceEditor.getCursorPosition();
  text = aceEditor.getSession().getValue().split("\n");
  for(i=0,pos=0;i<cursor.row;i++) {
    pos += text[i].length+1;
  }
  return pos+cursor.column;
}

setCursor = function(val) {
  var text = aceEditor.getSession().getValue();
  var row = column = 0;
  for(i=0;i<val;i++) {
    if(text[i]=="\n") {
      row++;
      column = 0;
    } else
      column++;
  }
  aceEditor.gotoLine(row+1);
  for(i=0; i<=column; i++) {
    aceEditor.selection.moveCursorRight();
  }
}

randomString = function() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

keyHandler = function (event) {
  var key = event.which || event.keyCode;
  if(noNeed.indexOf(key)==-1 && !(event.altKey || event.ctrlKey)) {
    var cpos = getCursor();
    socket.emit('edit', {cursor: cpos, version: docVersion, sbstr: selectedText, edit: String.fromCharCode(key)});
    return false;
  }
}

socket.on('edit', function (data){
  var text = aceEditor.getSession().getValue();
  var currentCursor = getCursor();
  if(data.d.edit == '\b') {
    if(nickname==data.n) {
      text = text.substr(0,data.d.cursor) + text.substr(data.d.cursor);
      data.d.cursor--;
    } else
      text = text.substr(0,data.d.cursor) + text.substr(data.d.cursor+1);
  } else {
    text = text.substr(0,data.d.cursor) + data.d.edit + text.substr(data.d.cursor);
  }
  docVersion += 1;
  aceEditor.getSession().setValue(text);
  if(data.n == nickname){
    setCursor(data.d.cursor);
  } else {
    if(data.d.cursor>=currentCursor)
      setCursor(currentCursor-1);
    else
      setCursor(currentCursor);
  }
});

socket.on('version', function(data){
  version = data.version;
  aceEditor.getSession().setValue(data.text);
});

socket.on('nickname?', function(data){
  nickname = prompt('Your nickname?');
  nickname = (nickname===null)? randomString() : nickname;
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
