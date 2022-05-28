import clipboardy from 'clipboardy';
import events from 'events';

var contentChange = new events.EventEmitter();
var oldContent = '';

contentChange.on("newContent", function(data){
    console.log(data);
}); 

setInterval(function(){
    // console.log("this is console.log");
    var content = clipboardy.readSync();
    if (content) {
        if (oldContent !== content) {
            contentChange.emit("newContent", content)
            oldContent = content
        }
    }
},100);