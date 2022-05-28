import clipboardy from 'clipboardy';
import events from 'events';
import { Command } from 'commander';

import { Server } from "socket.io";
import { io } from "socket.io-client";

const contentChange = new events.EventEmitter();
const program = new Command()
const _PORT = 5555
var oldContent = '';


program
  .name('Quick Paste')
  .description('Share your clipboard to other PC')
  .version('0.0.0')
  .option('--ip <char>', 'Connect to other PC to share clipboard');
program.parse();

contentChange.on("newContent", function(data){
    console.log(data);
}); 

setInterval(function(){
    // console.log("this is console.log");
    try {
        var content = clipboardy.readSync();
    } catch (error) {
        // console.log(error);
    }

    if (content) {
        if (oldContent !== content) {
            contentChange.emit("newContent", content)
            oldContent = content
        }
    }
},1000);

if (program.opts().ip) {
    console.log("This is a client")
    const socket = io(`ws://${program.opts().ip}:${_PORT}`);

    // send a message to the server
    socket.emit("hello from client", 5, "6", { 7: Uint8Array.from([8]) });

    // receive a message from the server
    socket.on("hello from server", (...args) => {
    // ...
    });

} else {
    console.log("this is server")
    const io = new Server(_PORT);

    io.on("connection", (socket) => {
      // send a message to the client
      socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

      // receive a message from the client
      socket.on("hello from client", (...args) => {
        // ...
      });
    });
}