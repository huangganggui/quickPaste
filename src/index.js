import clipboardy from 'clipboardy';
import events from 'events';
import { Command } from 'commander';
import { Server } from "socket.io";
import { io } from "socket.io-client";
import { networkInterfaces } from 'os';

import { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, QIcon } from '@nodegui/nodegui';
import logo from '../assets/logo.svg';

const win = new QMainWindow();
win.setWindowTitle("Hello World");

const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);

const label = new QLabel();
label.setObjectName("mylabel");
label.setText("Hello");

const button = new QPushButton();
button.setIcon(new QIcon(logo));

const label2 = new QLabel();
label2.setText("World");
label2.setInlineStyle(`
  color: red;
`);

rootLayout.addWidget(label);
rootLayout.addWidget(button);
rootLayout.addWidget(label2);
win.setCentralWidget(centralWidget);
win.setStyleSheet(
  `
    #myroot {
      background-color: #009688;
      height: '100%';
      align-items: 'center';
      justify-content: 'center';
    }
    #mylabel {
      font-size: 16px;
      font-weight: bold;
      padding: 1;
    }
  `
);
win.show();

const contentChange = new events.EventEmitter();
const program = new Command()
const _PORT = 5555
var oldContent = '';  // TODO: global var not safe, change it
const SIO_EVENT_CLIPBOARD_NEW_CONTENT = "SIOEventClipboardNewContent"
const LOCAL_EVENT_CLIPBOARD_NEW_CONTENT = "LocalEventClipboardNewContent"

program
  .name('Quick Paste')
  .description('Share your clipboard to other PC')
  .version('0.0.0')
  .option('--ip <char>', 'Connect to other PC to share clipboard');
program.parse(); 

function listenEvent(socket, role) {
    socket.on(SIO_EVENT_CLIPBOARD_NEW_CONTENT, data => {
        oldContent = data;  // TODO: not safe here
        clipboardy.writeSync(data);
        // console.log(" content has been write to clipboard:", data)
        if (role === "server") {
            // send message to all clients except sender
            socket.broadcast.emit("SIO_EVENT_CLIPBOARD_NEW_CONTENT", data)
        }
    });

    contentChange.on(LOCAL_EVENT_CLIPBOARD_NEW_CONTENT, function(data){
        socket.emit(SIO_EVENT_CLIPBOARD_NEW_CONTENT, data);
    });
}

function getLocalIPs(){
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }
    return results;
}

setInterval(function(){
    try {
        var content = clipboardy.readSync();
    } catch (error) {
        // console.log(error);
    }

    if (content) {
        if (oldContent !== content) {  // TODO: not safe here
            contentChange.emit(LOCAL_EVENT_CLIPBOARD_NEW_CONTENT, content)
            oldContent = content
        }
    }
},1000);

if (program.opts().ip) {
    console.log("This is a client")
    const socket = io(`ws://${program.opts().ip}:${_PORT}`);
    listenEvent(socket, "client")

} else {

    console.log("This is server, IP is:", getLocalIPs())
    const io = new Server(_PORT);

    io.on("connection", (socket) => {
        console.log("connected");
        listenEvent(socket, "server");
    });
}