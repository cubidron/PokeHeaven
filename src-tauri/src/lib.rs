pub mod commands;
pub mod error;

pub use error::Error;

pub type Result<T> = std::result::Result<T, Error>;

use commands::authenticate;
use tauri::Manager;
use tauri_plugin_http::reqwest;

struct AppState {
    request: reqwest::Client,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![authenticate])
        // .setup(|app| {
        //     app.manage(AppState {
        //         request: reqwest::ClientBuilder::new()
        //             .user_agent("Cubidron Apps")
        //             .build()?,
        //     });

        //     Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
