#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use rodio::{Decoder, OutputStream, Sink, Source};
use std::{io::Cursor, sync::Mutex};
use tauri::State;

struct MainSpeaker(Mutex<Sink>);

#[tauri::command]
async fn play_sound(main_speaker: State<'_, MainSpeaker>) -> Result<(), ()> {
    let file = Cursor::new(include_bytes!("../assets/audio/alarm.mp3"));

    let source = Decoder::new(file).unwrap();

    main_speaker
        .0
        .lock()
        .unwrap()
        .append(source.repeat_infinite());

    Ok(())
}

#[tauri::command]
async fn stop_sound(main_speaker: State<'_, MainSpeaker>) -> Result<(), ()> {
    main_speaker.0.lock().unwrap().stop();
    Ok(())
}

fn main() {
    let (_stream, stream_handle) = OutputStream::try_default().unwrap();
    let sink = Sink::try_new(&stream_handle).unwrap();

    tauri::Builder::default()
        .manage(MainSpeaker(Mutex::new(sink)))
        .invoke_handler(tauri::generate_handler![play_sound, stop_sound])
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
