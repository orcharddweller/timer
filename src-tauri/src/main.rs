#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink};
use serde_json::json;
use std::path::PathBuf;
use std::{io::Cursor, sync::Mutex};
use tauri::{Manager, State, Wry};
use tauri_plugin_store::{with_store, StoreCollection};

const STORE_PATH: &str = ".settings.dat";

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
        sink.stop();
    }

    Ok(())
}

#[tauri::command]
async fn set_volume(
    volume: f32,
    volume_state: State<'_, Volume>,
    main_speaker: State<'_, MainSpeaker>,
    stores: State<'_, StoreCollection<Wry>>,
    app_handle: tauri::AppHandle,
) -> Result<(), tauri_plugin_store::Error> {
    {
        let mut volume_state = volume_state.0.lock().unwrap();

        *volume_state = volume;
    }
    {
        let mut main_speaker = main_speaker.0.lock().unwrap();

        if let Some(sink) = main_speaker.as_mut() {
            sink.set_volume(volume);
        }
    }

    let path = PathBuf::from(STORE_PATH);

    with_store(app_handle, stores, path, |store| {
        store.insert("volume".into(), json!(volume))
    })?;

    Ok(())
}

fn main() {
    let (_stream, stream_handle) = OutputStream::try_default().unwrap();

    tauri::Builder::default()
        .manage(MainSpeaker(Mutex::new(None)))
        .manage(MainStream(stream_handle))
        .manage(Volume(Mutex::new(1.0)))
        .setup(|app| {
            let path = PathBuf::from(STORE_PATH);
            let stores = app.state::<StoreCollection<Wry>>();

            let volume = with_store(app.handle(), stores, path, |store| {
                Ok(store
                    .get("volume")
                    .map(|v| v.as_f64().unwrap_or(1.0) as f32)
                    .unwrap_or(1.0))
            })?;

            let volume_state = app.state::<Volume>();

            let mut volume_state = volume_state.0.lock().unwrap();

            *volume_state = volume;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![play_sound, stop_sound, set_volume])
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
