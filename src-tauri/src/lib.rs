pub mod commands;
pub mod error;

pub use error::Error;

pub type Result<T> = std::result::Result<T, Error>;

use tauri::Manager;
use tauri_plugin_http::reqwest;

pub struct AppState {
    request: reqwest::Client,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_drpc::init())
        .invoke_handler(tauri::generate_handler![commands::launch])
        .setup(|app| {
            let request = reqwest::Client::builder()
                .user_agent(concat!(
                    env!("CARGO_PKG_NAME"),
                    "/",
                    env!("CARGO_PKG_VERSION"),
                ))
                .cookie_store(true)
                .build()
                .unwrap();

            app.manage(AppState { request });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
