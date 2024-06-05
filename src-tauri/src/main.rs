// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate arboard;

use arboard::Clipboard;
use serde_json::json;

use std::net::{Ipv4Addr, UdpSocket};
use std::{thread, time};
use std::time::Duration;

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

const BROADCAST_MESSAGE: &str = "Broadcasting message!";
// const BROADCAST_MESSAGE: &str = 
const BROADCAST_PORT: u16 = 12345;

fn listen_for_packets(socket: UdpSocket) {
    // let sleep_time = time::Duration::from_millis(1000);

    loop {
        // thread::sleep(sleep_time);
        
        let mut buf = [0; 1024];
        // hang if no message
        match socket.recv_from(&mut buf) {
            Ok((num_bytes, src)) => {
                let message = String::from_utf8_lossy(&buf[..num_bytes]);
                println!("Received packet from {}: {}", src.ip(), message);
            },
            Err(e) => {
                eprintln!("Error receiving packet: {}", e);
                break;
            },
        }

    }
}

fn broadcast_message(socket: UdpSocket) {
    let destination_addr = (Ipv4Addr::BROADCAST, BROADCAST_PORT);
    // let bytes_to_send = BROADCAST_MESSAGE.as_bytes();
    let string = json!({
        "key1": "value1",
        "key2": 42,
        "key3": true
    }).to_string();

    let bytes_to_send = string.as_bytes();
    
    if let Err(e) = socket.send_to(bytes_to_send, destination_addr) {
        eprintln!("Error sending packet: {}", e);
    } else {
        println!("Broadcasted '{}' successfully!", Ipv4Addr::BROADCAST);
    }
}


fn main() {
    // Bind the socket to any available port and set up broadcasting
    // sudo lsof -i:12345
    let socket = UdpSocket::bind("0.0.0.0:12345").expect("Failed to bind UDP socket");
    socket.set_broadcast(true).expect("Failed to set broadcast option");

    // Start a thread to listen for incoming packets
    let listener_socket = socket.try_clone().expect("Failed to clone socket");
    let handle = thread::spawn(move || {
        listen_for_packets(listener_socket);
    });

    // Give the listener thread time to start before starting to broadcast
    std::thread::sleep(Duration::from_millis(100));

    // Broadcast a message to all network interfaces
    broadcast_message(socket);

    // handle.join().expect("Thread panicked");

    // 
    let mut clipboard = Clipboard::new().unwrap();
    println!("Clipboard text was: {}", clipboard.get_text().unwrap());

    let the_string = "Hello, world!";
    clipboard.set_text(the_string).unwrap();
    println!("But now the clipboard text should be: \"{}\"", the_string);
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![my_custom_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");    
}
