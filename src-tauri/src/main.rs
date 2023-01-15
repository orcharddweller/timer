#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink};
use std::{io::Cursor, sync::Mutex};
use tauri::State;

struct MainSpeaker(Mutex<Option<Sink>>);
struct MainStream(OutputStreamHandle);
struct Volume(Mutex<f32>);

#[tauri::command]
async fn play_sound(
    main_speaker: State<'_, MainSpeaker>,
    main_stream: State<'_, MainStream>,
    volume_state: State<'_, Volume>,
) -> Result<(), ()> {
    let file = Cursor::new(include_bytes!("../assets/audio/alarm.mp3"));

    let source = Decoder::new(file).unwrap();

    let mut main_speaker = main_speaker.0.lock().unwrap();

    let volume = *volume_state.0.lock().unwrap();

    let stream_handle = main_stream.0.clone();

    if main_speaker.is_some() {
        return Ok(());
    }

    let sink = Sink::try_new(&stream_handle).unwrap();

    sink.set_volume(volume);

    sink.append(source);

    *main_speaker = Some(sink);

    Ok(())
}

#[tauri::command]
async fn stop_sound(main_speaker: State<'_, MainSpeaker>) -> Result<(), ()> {
    let mut main_speaker = main_speaker.0.lock().unwrap();

    if let Some(sink) = main_speaker.take() {
        println!("Stopping sound...");

        sink.stop();
    }

    Ok(())
}

#[tauri::command]
async fn set_volume(
    volume: f32,
    volume_state: State<'_, Volume>,
    main_speaker: State<'_, MainSpeaker>,
) -> Result<(), ()> {
    let mut main_speaker = main_speaker.0.lock().unwrap();
    let mut volume_state = volume_state.0.lock().unwrap();

    *volume_state = volume;

    if let Some(sink) = main_speaker.as_mut() {
        sink.set_volume(volume);
    }

    Ok(())
}

fn main() {
    let (_stream, stream_handle) = OutputStream::try_default().unwrap();

    tauri::Builder::default()
        .manage(MainSpeaker(Mutex::new(None)))
        .manage(MainStream(stream_handle))
        .manage(Volume(Mutex::new(1.0)))
        .invoke_handler(tauri::generate_handler![play_sound, stop_sound, set_volume])
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
