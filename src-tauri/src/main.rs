// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate arboard;

use arboard::Clipboard;
use sprintf::sprintf;

use std::net::{Ipv4Addr, UdpSocket};
use std::{thread, time};
use std::time::Duration;

use std::sync::{Mutex, Arc};

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize)]
struct UdpMessage {
    msg_from: String, // mac addr or host name
    msg_type: String,
    msg_content: String
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn my_custom_command() -> String {
    println!("I was invoked from JS!");
    format!("Hello, vue")
}

// https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers
const BROADCAST_PORT: u16 = 28996;

fn listen_for_packets(socket: UdpSocket, record: Arc<Mutex<String>>) {
    // let sleep_time = time::Duration::from_millis(1000);
    let mut clipboard_paste = Clipboard::new().unwrap();
    loop {
        // thread::sleep(sleep_time);
        
        let mut buf = [0; 1024];
        // hang if no message
        match socket.recv_from(&mut buf) {
            Ok((num_bytes, src)) => {
                let message = String::from_utf8_lossy(&buf[..num_bytes]);

                match serde_json::from_str::<UdpMessage>(&message) {
                    Ok(msg) => {
                        println!("from: {}, type: {}, content{}", msg.msg_from, msg.msg_type, msg.msg_content);
                        let mut clipboard_content_record = record.lock().unwrap();
                        if(format!("{}", msg.msg_content) != format!("{}", clipboard_content_record)) {
                            clipboard_paste.set_text(msg.msg_content).unwrap();
                        } else {
                            println!("same content. ignore: {}", msg.msg_content);
                        }
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
    let destination_addr = (Ipv4Addr::BROADCAST, BROADCAST_PORT);
    // let bytes_to_send = BROADCAST_MESSAGE.as_bytes();
    let msg = UdpMessage{
        msg_from: String::from("xxx"),
        msg_type: String::from("xxx"),
        msg_content: content.to_string()
    };
    let msg_serialized = serde_json::to_string(&msg).unwrap();

    let msg_bytes = msg_serialized.as_bytes();
    
    if let Err(e) = socket.send_to(msg_bytes, destination_addr) {
        eprintln!("Error sending packet: {}", e);
    } else {
        // println!("Broadcasted '{}' successfully!", content);
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
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![my_custom_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");    
    
}
