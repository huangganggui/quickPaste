// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[macro_use]
extern crate lazy_static;

extern crate arboard;

use arboard::Clipboard;
use sprintf::sprintf;

use std::net::{Ipv4Addr, UdpSocket};
use std::{thread, time};
use std::time::Duration;

use std::sync::{Mutex, Arc};

use serde::{Deserialize, Serialize};
use serde_json::Value;

use network_interface::NetworkInterface;
use network_interface::NetworkInterfaceConfig;

#[derive(Serialize, Deserialize)]
struct UdpMessage {
    msg_pincode: String,
    msg_from: String, // mac addr or host name
    msg_type: String,
    msg_content: String
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn set_pincode(code: &str) -> String {
    let mut pincode_record = PINCODE.lock().unwrap();
    println!("get pincode , {}!", code);
    *pincode_record = code.to_string();
    std::mem::drop(pincode_record);

    // todo: check if have to clear clipboard record after set pincode
    format!("done!")
}

// https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers
const BROADCAST_PORT: u16 = 28996;

// 使用lazy_static!创建全局变量
lazy_static! {
    static ref PINCODE: Arc<Mutex<String>> = Arc::new(Mutex::new(String::from("")));
}

fn listen_for_packets(socket: UdpSocket, record: Arc<Mutex<String>>) {
    // let sleep_time = time::Duration::from_millis(1000);
    let mut clipboard_paste = Clipboard::new().unwrap();
    loop {
        // thread::sleep(sleep_time);
        
        let mut buf = [0; 1024];
        // hang if no message
        match socket.recv_from(&mut buf) {
            Ok((num_bytes, _src)) => {
                let message = String::from_utf8_lossy(&buf[..num_bytes]);

                match serde_json::from_str::<UdpMessage>(&message) {
                    Ok(msg) => {
                        println!("from: {}, type: {}, content: {}, pincode: {}", msg.msg_from, msg.msg_type, msg.msg_content, msg.msg_pincode);
                        let mut clipboard_content_record = record.lock().unwrap();
                        let mut pincode_record = PINCODE.lock().unwrap();

                        if(format!("{}", msg.msg_content) != format!("{}", clipboard_content_record) && format!("{}", msg.msg_pincode) == format!("{}", pincode_record)) {
                            // change record first avoid double trig in roll thread
                            *clipboard_content_record = msg.msg_content.clone();
                            println!("write to clipboard:{}", msg.msg_content);
                            clipboard_paste.set_text(msg.msg_content).unwrap();
                        } else {
                            println!("same content or pin code not match. ignore: {}, {}", msg.msg_content, msg.msg_content);
                        }
                        // release
                        std::mem::drop(clipboard_content_record);
                        std::mem::drop(pincode_record);
                    },
                    Err(e) => println!("Failed to deserialize JSON: {}", e),
                }
            },
            Err(e) => {
                eprintln!("Error receiving packet: {}", e);
                break;
            },
        }

    }
}

fn broadcast_message(socket: &UdpSocket, content: String) {
    // let bytes_to_send = BROADCAST_MESSAGE.as_bytes();
    let mut pincode_record = PINCODE.lock().unwrap();

    if pincode_record.len() != 4 {
        println!("pincode not set, skip!");
        return
    }

    let msg = UdpMessage{
        msg_pincode: pincode_record.to_string(),
        msg_from: String::from("xxx"),
        msg_type: String::from("xxx"),
        msg_content: content.to_string()
    };
    std::mem::drop(pincode_record);

    let msg_serialized = serde_json::to_string(&msg).unwrap();

    let msg_bytes = msg_serialized.as_bytes();

    let network_interfaces = NetworkInterface::show().unwrap();

    for itf in network_interfaces.iter() {
        if (itf.addr[0].broadcast() != None) {
            // println!("{:?}", itf.addr[0].broadcast().unwrap());
            let destination_addr = (itf.addr[0].broadcast().unwrap(), BROADCAST_PORT);

            if let Err(e) = socket.send_to(msg_bytes, destination_addr) {
                eprintln!("Error sending packet: {}", e);
            } else {
                // println!("Broadcasted '{}' successfully!", content);
            }
        }
    }
}

fn poll_clipboard(socket: UdpSocket, record: Arc<Mutex<String>>,) {
    let mut clipboard_read = Clipboard::new().unwrap();
    let sleep_time = time::Duration::from_millis(1000);

    loop {
        thread::sleep(sleep_time);
        let clipboard_content_new = clipboard_read.get_text().unwrap_or(String::from(""));
        let mut clipboard_content_record = record.lock().unwrap();
        
        // println!("loop...");
        // println!("clipboard text: \"{}\"", clipboard_content_new);
        // println!("record: \"{}\"", clipboard_content_record);
        if (format!("{}", clipboard_content_new)==format!("{}", clipboard_content_record)) {
            // println!("same,  do nothing"); 
        } else {
            *clipboard_content_record = clipboard_content_new.clone();
            println!("new conent! emit it:{}", clipboard_content_new);
            broadcast_message(&socket, clipboard_content_new);
        }
        // release
        std::mem::drop(clipboard_content_record);

    }
}

fn main() {
    // Bind the socket to any available port and set up broadcasting
    // sudo lsof -i:12345
    let socket = UdpSocket::bind(sprintf!("0.0.0.0:%d", BROADCAST_PORT).unwrap()).expect("Failed to bind UDP socket");
    socket.set_broadcast(true).expect("Failed to set broadcast option");

    // Start a thread to listen for incoming packets
    let listener_socket = socket.try_clone().expect("Failed to clone socket");

    let mut clipboard_content_record = Arc::new(Mutex::new(String::from("")));

    let record = clipboard_content_record.clone();
    thread::spawn(move || {
        listen_for_packets(listener_socket, record);
    });

    // Start a thread to poll clipboard
    let record2 = clipboard_content_record.clone();
    thread::spawn(move || {
        poll_clipboard(socket, record2);
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![set_pincode])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");    
    
}
