
/*
 * Random ID generator
 */

var uid = exports

uid.gen = function() {
  return randomString(64);
}

function randomString(bits) {
  var chars, rand, i, ret;
  chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  ret='';
  while(bits > 0){
    rand=Math.floor(Math.random()*0x100000000); // 32-bit integer
    for(i=26; i>0 && bits>0; i-=6, bits-=6)
      ret+=chars[0x3F & rand >>> i];
  }
  return ret;
}
