import clipboardy from 'clipboardy';
import events from 'events';
import { Command } from 'commander';
import { Server } from "socket.io";
import { io } from "socket.io-client";
import { networkInterfaces } from 'os';

import { QMainWindow, QWidget, QLabel, QPushButton, QIcon, QRadioButton, QLineEdit, QBoxLayout } from '@nodegui/nodegui';
import logo from '../assets/logo.svg';

const localEvent = new events.EventEmitter();
const program = new Command()
const _PORT = 5555
var oldContent = '';  // TODO: global var not safe, change it
const SIO_EVENT_CLIPBOARD_NEW_CONTENT = "SIOEventClipboardNewContent"
const LOCAL_EVENT_CLIPBOARD_NEW_CONTENT = "LocalEventClipboardNewContent"
const LOCAL_EVENT_STOPSIO = "LocalEventStopSio"

// window
const win = new QMainWindow();
win.setWindowTitle("Hello World");

//layout
const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
// centralWidget.setLayout(rootLayout);

const rootLayout = new QBoxLayout(2);
centralWidget.setLayout(rootLayout);

const ClientLayout = new QBoxLayout(2);
ClientLayout.addSpacing(5)
const ServerLayout = new QBoxLayout(2);
const logLayout = new QBoxLayout(2);


rootLayout.addLayout(ClientLayout);
rootLayout.addLayout(ServerLayout);
rootLayout.addLayout(logLayout);


// widget
// client
const  radioButtonClient = new QRadioButton();
radioButtonClient.click() // default as client
radioButtonClient.setText("As Client");

const labelClientLableInputIpReminder = new QLabel();
labelClientLableInputIpReminder.setText("Input server IP:");

const inputClientIp = new QLineEdit();

const buttonClientConnect = new QPushButton();
buttonClientConnect.setText("connect") // or disconnect

ClientLayout.addWidget(radioButtonClient);
ClientLayout.addWidget(labelClientLableInputIpReminder);
ClientLayout.addWidget(inputClientIp);
ClientLayout.addWidget(buttonClientConnect);

// server
const  radioButtonServer = new QRadioButton();
radioButtonServer.setText("As Server");

const labelServerIpReminder = new QLabel();
labelServerIpReminder.setText("Server IP:");

const labelClientLableIpShow = new QLabel();

const buttonServerStart = new QPushButton();
buttonServerStart.setText("start") // or disconnect

ServerLayout.addWidget(radioButtonServer);
ServerLayout.addWidget(labelServerIpReminder);
ServerLayout.addWidget(labelClientLableIpShow);
ServerLayout.addWidget(buttonServerStart);

win.setCentralWidget(centralWidget);
win.setStyleSheet(
  `
    #myroot {
      background-color: #19c287;
      min-height: '100';
      min-width: '100';
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
// UI event
function setUiMode(isServer) {
    //widget
    labelClientLableInputIpReminder.setEnabled(!isServer);
    inputClientIp.setEnabled(!isServer);
    buttonClientConnect.setText('connect')
    buttonClientConnect.setEnabled(!isServer);
    
    //server widget
    labelServerIpReminder.setEnabled(isServer);
    labelClientLableIpShow.setEnabled(isServer);
    labelServerIpReminder.setText('Server IP is:'+isServer?getLocalIPs():'');
    buttonServerStart.setText('start')
    buttonServerStart.setEnabled(isServer);
}

// used as client
radioButtonClient.addEventListener('clicked',(checked)=>{
    localEvent.emit(LOCAL_EVENT_STOPSIO)
    setUiMode(false);
});

//used as server
radioButtonServer.addEventListener('clicked',(checked)=>{
    localEvent.emit(LOCAL_EVENT_STOPSIO)
    setUiMode(true);
});

setUiMode(false)
win.show();

program
  .name('Quick Paste')
  .description('Share your clipboard to other PC')
  .version('0.0.0')
  .option('--ip <char>', 'Connect to other PC to share clipboard');
program.parse(); 

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
    return results.toString();
}

function clientStart(ip, callback) {
    console.log('connecting');
    const socket = io(`ws://${ip}:${_PORT}`);
    var clipboardChecker = null
    
    localEvent.once(LOCAL_EVENT_STOPSIO, ()=>{
        if (clipboardChecker) clearInterval(clipboardChecker);

        if (socket.connected){
            socket.disconnect();
            console.log("sio disconnected");
        }
        socket.close();
    })

    socket.on('connect', ()=>{
        console.log("connect to server success");
        // client connected ,start monitor and transfer
        // start monitor clipboard
        oldContent = clipboardy.readSync();
        clipboardChecker = setInterval(()=>{
            try {
                var content = clipboardy.readSync();
            } catch (error) {
                // console.log(error);
            }
        
            if (content) {
                if (oldContent !== content) {  // TODO: not safe here
                    socket.emit(SIO_EVENT_CLIPBOARD_NEW_CONTENT, content);
                    oldContent = content;
                }
            }
        }, 1000);
        callback()
    });
    socket.on(SIO_EVENT_CLIPBOARD_NEW_CONTENT, data => {
        oldContent = data;  // TODO: not safe here
        clipboardy.writeSync(data);
        console.log(" content has been write to clipboard:", data)
    });
    socket.on("disconnect", data => {

    });
}

function serverStart(callback) {

    console.log("server starting")
    const io = new Server({});
    // oldContent = clipboardy.readSync();
    // const clipboardChecker = setInterval(()=>{
    //     try {
    //         var content = clipboardy.readSync();
    //     } catch (error) {
    //         // console.log(error);
    //     }
    
    //     if (content) {
    //         if (oldContent !== content) {  // TODO: not safe here
    //             io.emit(SIO_EVENT_CLIPBOARD_NEW_CONTENT, content);
    //             oldContent = content;
    //         }
    //     }
    // }, 1000);

    // localEvent.once(LOCAL_EVENT_STOPSIO, ()=>{
    //     localEvent.removeEventListener(clipboardChecker)
    //     console.log('get event LOCAL_EVENT_STOPSIO')
    //     io.disconnectSockets()
    //     io.close()
    // });

    io.on("connection", (socket) => {
        console.log("connected");
        // // listen clients message
        // socket.on('connect', ()=>{
        //     console.log("a client connected to this server");
        //     // client connected ,start monitor and transfer
        //     callback()
        // });

        // socket.on(SIO_EVENT_CLIPBOARD_NEW_CONTENT, data => {
        //     oldContent = data;  // TODO: not safe here
        //     clipboardy.writeSync(data);
        //     socket.broadcast.emit()
        // });
    
        // socket.on("disconnect", ()=>{
        // });
    });

    io.listen(_PORT, ()=>{
        console.log("server listening ...")
        callback()
    });
}

// button state not safe, TODO: fix it
buttonClientConnect.addEventListener('clicked',(checked)=>{
    console.log(buttonClientConnect.text());
    if (buttonClientConnect.text() === 'connect') {
        buttonClientConnect.setText("connecting")
        clientStart(inputClientIp.text(), ()=>{
            console('this is client callback')
            buttonClientConnect.setText("disconnect")
        });
    } else if (buttonClientConnect.text() === 'disconnect' || buttonClientConnect.text() === "connecting") {
        console.log('disconnecting');
        localEvent.emit(LOCAL_EVENT_STOPSIO)
        buttonClientConnect.setText('connect')
    }
});

buttonServerStart.addEventListener('clicked', ()=>{
    if (buttonServerStart.text() === 'start') {
        buttonServerStart.setText("starting")
        serverStart(()=>{
            buttonServerStart.setText("stop")
        });
    } else if (buttonServerStart.text() === 'stop' || buttonServerStart.text() === "starting") {
        localEvent.emit(LOCAL_EVENT_STOPSIO)
        buttonServerStart.setText('start')
    }
})