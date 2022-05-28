import clipboardy from 'clipboardy';
import events from 'events';
import { Command } from 'commander';

import { Server } from "socket.io";
import { io } from "socket.io-client";

const contentChange = new events.EventEmitter();
const program = new Command()
const _PORT = 5555
var oldContent = '';  // TODO: global var not safe, change it


program
  .name('Quick Paste')
  .description('Share your clipboard to other PC')
  .version('0.0.0')
  .option('--ip <char>', 'Connect to other PC to share clipboard');
program.parse(); 

function listenEvent(socket, ) {
    socket.on("clipboardNewContent", data => {
        oldContent = data;  // TODO: not safe here
        clipboardy.writeSync(data);
        // console.log(" content has been write to clipboard:", data)

    });

    contentChange.on("EventClipboardNewContent", function(data){
        socket.emit("clipboardNewContent", data);
    });
}

setInterval(function(){
    try {
        var content = clipboardy.readSync();
    } catch (error) {
        // console.log(error);
    }

    if (content) {
        if (oldContent !== content) {  // TODO: not safe here
            contentChange.emit("EventClipboardNewContent", content)
            oldContent = content
        }
    }
},1000);

if (program.opts().ip) {
    console.log("This is a client")
    const socket = io(`ws://${program.opts().ip}:${_PORT}`);
    listenEvent(socket)

} else {
    console.log("this is server")
    const io = new Server(_PORT);

    io.on("connection", (socket) => {
        console.log("connected");
        listenEvent(socket);
    });
}