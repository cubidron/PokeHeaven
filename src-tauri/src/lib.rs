pub mod commands;
pub mod error;
pub mod helpers;

use commands::GAME;
pub use error::Error;

pub type Result<T> = std::result::Result<T, Error>;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};
use tauri_plugin_http::reqwest;

pub struct AppState {
    request: reqwest::Client,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    log::info!("Starting launcher");
    tauri::Builder::default()
        .plugin(tauri_plugin_system_info::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            log::info!("Another instance of the launcher is already running.");
            app.get_webview_window("main").unwrap().set_focus().ok();
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_drpc::init())
        .invoke_handler(tauri::generate_handler![commands::launch])
        .setup(|app| {
            log::info!("Setting up launcher");
            let quit = MenuItem::with_id(
                app,
                "quit",
                "Close launcher. (Game also closes)",
                true,
                None::<&str>,
            )?;
            let close_game =
                MenuItem::with_id(app, "close_game", "Close game.", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&close_game, &quit])?;

            TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |app, event| {
                    let app_clone = app.clone();
                    match event.id.as_ref() {
                        "quit" => {
                            log::info!("Quitting launcher");
                            tauri::async_runtime::spawn(async move {
                                let mut game = GAME.lock().await;
                                if let Some(mut child) = game.take() {
                                    child.kill().await.ok();
                                    app_clone.exit(0);
                                } else {
                                    app_clone.exit(0);
                                }
                            });
                        }
                        _ => {
                            log::info!("Closing game");
                            tauri::async_runtime::spawn(async move {
                                let mut game = GAME.lock().await;
                                if let Some(mut child) = game.take() {
                                    child.kill().await.ok();
                                }
                            });
                        }
                    }
                })
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?;

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
            log::info!("Launcher setup complete");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
