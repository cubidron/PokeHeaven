use std::path::PathBuf;
use std::sync::LazyLock;
use std::time::Duration;

use lyceris::minecraft::{config::Profile, emitter::Emitter as LycerisEmitter};
use serde::{Deserialize, Serialize};
use tauri::async_runtime::Mutex;
use tauri::{Emitter, Manager};
use tauri::{State, Window};
use tauri_plugin_http::reqwest::Client;
use tokio::process::Child;

use lyceris::auth::microsoft::{
    authenticate as ms_authenticate, create_link, MinecraftAccount, AUTH_URL, REDIRECT_URI,
};
use tauri::{webview::PageLoadEvent, AppHandle, Url, WebviewUrl, WebviewWindowBuilder};

static AUTHENTICATION_WINDOW_LABEL: &str = "auth";

use crate::helpers::{get_loader_by, set_optional_mods, synchronize_files};
use crate::AppState;

// The main instance of the minecraft process
pub static GAME: LazyLock<Mutex<Option<Child>>> = LazyLock::new(|| Mutex::new(None));

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    title: String,
    profile: String,
    version: String,
    account: MinecraftAccount,
    ip: String,
    port: u32,
    direct_connect: bool,
    minecraft: MinecraftConfig,
    game_dir: String,
    memory: u64,
    fullscreen: bool,
    after: String,
    optional_mods: Vec<OptionalMod>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct MinecraftConfig {
    version: String,
    loader: LoaderConfig,
    exclude: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct LoaderConfig {
    r#type: String,
    version: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct OptionalMod {
    pub file_name: String,
    pub enabled: bool,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Payload {
    current: u64,
    total: u64,
    path: String,
    #[serde(rename = "fileType")]
    file_type: String,
}

#[tauri::command]
pub async fn launch(window: Window, state: State<'_, AppState>, cfg: Config) -> crate::Result<()> {
    log::info!(
        "Preparing launch with memory: {}, username: {}",
        cfg.memory * 512,
        cfg.account.username
    );
    let game_dir = PathBuf::from(cfg.game_dir);
    let minecraft_version_separated = cfg.minecraft.version.split('.').collect::<Vec<&str>>();
    if minecraft_version_separated.len() < 2 {
        return Err(crate::Error::General(
            "Invalid minecraft version format".to_string(),
        ));
    }

    let lyceris_config = lyceris::minecraft::config::Config {
        game_dir: game_dir.clone(),
        profile: Some(Profile {
            name: cfg.profile.clone(),
            root: game_dir.join("profiles"),
        }),
        version: cfg.minecraft.version.clone(),
        authentication: lyceris::auth::AuthMethod::Microsoft {
            username: cfg.account.username,
            xuid: cfg.account.xuid,
            uuid: cfg.account.uuid,
            access_token: cfg.account.access_token,
            refresh_token: cfg.account.refresh_token,
        },
        memory: Some(lyceris::minecraft::config::Memory::Megabyte(
            cfg.memory * 512,
        )),
        version_name: None,
        loader: get_loader_by(&cfg.minecraft.loader.r#type, &cfg.minecraft.loader.version),
        client: Some(state.request.clone()),
        java_version: None,
        runtime_dir: None,
        custom_java_args: vec![],
        custom_args: {
            let mut args = vec![];
            if cfg.direct_connect {
                args.extend(
                    if minecraft_version_separated
                        .get(1)
                        .and_then(|v| v.parse::<u16>().ok())
                        .unwrap_or_default()
                        >= 20
                    {
                        vec![
                            "--quickPlayMultiplayer".to_string(),
                            format!("{}:{}", cfg.ip, cfg.port),
                        ]
                    } else {
                        vec![
                            "--server".to_string(),
                            cfg.ip.clone(),
                            "--port".to_string(),
                            cfg.port.to_string(),
                        ]
                    },
                );
            }

            if cfg.fullscreen {
                args.push("--fullscreen".to_string());
            }
            args
        },
    };

    let emitter = LycerisEmitter::default();

    emitter
        .on(
            lyceris::minecraft::emitter::Event::MultipleDownloadProgress,
            {
                let window = window.clone();
                move |(path, current, total, file_type): (String, u64, u64, String)| {
                    window
                        .emit(
                            "progress",
                            Payload {
                                current,
                                total,
                                path,
                                file_type,
                            },
                        )
                        .ok();
                }
            },
        )
        .await;

    log::info!("Installing/checking game");
    lyceris::minecraft::install::install(&lyceris_config, Some(&emitter)).await?;

    log::info!("Synchronizing files");
    let profile_dir = game_dir.join("profiles").join(cfg.profile.clone());
    synchronize_files(
        profile_dir.clone(),
        cfg.profile,
        cfg.minecraft.exclude,
        &cfg.optional_mods,
        emitter.clone(),
        state.request.clone(),
    )
    .await?;

    set_optional_mods(profile_dir, &cfg.optional_mods).await?;

    let mut child = GAME.lock().await;

    log::info!("Launching game");

    *child = Some(lyceris::minecraft::launch::launch(&lyceris_config, Some(&emitter)).await?);

    log::info!("Game launched");

    match cfg.after.as_str() {
        "close" => {
            window.app_handle().exit(1);
        }
        "minimize" => {
            window.hide().ok();
        }
        _ => {}
    }

    tauri::async_runtime::spawn(async move {
        loop {
            let mut lock = GAME.lock().await;
            if let Some(status) = lock.as_mut().unwrap().try_wait()? {
                if !status.success() {
                    #[derive(Clone, Serialize, Deserialize)]
                    struct Payload {
                        title: String,
                        message: String,
                    }

                    log::info!("Launcher closed with a different status code. Game might have crashed. Status code: {}", status.code().unwrap_or_default());

                    window
                        .emit(
                            "crash",
                            Payload {
                                title: "Game crashed!".to_string(),
                                message: "It seems like your game just crashed. Please try again or check the crash reports log for more information.".to_string(),
                            },
                        )
                        .ok();
                }
                window.show().ok();
                window.set_focus().ok();
                break;
            }

            tokio::time::sleep(Duration::from_secs(1)).await;
        }
        Ok::<(), crate::Error>(())
    });

    Ok(())
}

/// This command authenticates user with
/// their Microsoft Account.
#[tauri::command]
pub async fn authenticate(app: AppHandle, window: Window) -> crate::Result<MinecraftAccount> {
    // Create a channel to receive the authentication result asynchronously.
    let (tx, mut rx) = tauri::async_runtime::channel::<crate::Result<MinecraftAccount>>(1);
    // Retrieve the authentication link and handle errors.
    let link = create_link()?;
    let parsed_url =
        Url::parse(&link).map_err(|_| crate::Error::General("Url parse error.".to_string()))?;
    let size = window
        .inner_size()
        .unwrap_or(tauri::PhysicalSize {
            width: 1600,
            height: 1200,
        })
        .to_logical::<f64>(if cfg!(target_os = "macos") {
            2f64
        } else {
            1f64
        });
    // Build the authentication window.
    WebviewWindowBuilder::new(
        &app,
        AUTHENTICATION_WINDOW_LABEL,
        WebviewUrl::External(parsed_url),
    )
    .inner_size(size.width, size.height)
    .content_protected(false)
    .title("Authentication")
    .center()
    .shadow(true)
    .theme(Some(tauri::Theme::Dark))
    .focused(true)
    .on_page_load({
        move |window, payload| {
            // We try to retrieve the code from the URL
            if let PageLoadEvent::Started = payload.event() {
                let url = payload.url();
                let tx = tx.clone();
                // Handle errors coming from
                // Microsoft authentication website.
                if [
                    REDIRECT_URI,
                    AUTH_URL,
                    "https://login.live.com/ppsecure/post.srf",
                ]
                .iter()
                .any(|valid_url| url.as_str().starts_with(valid_url))
                {
                    if let Some((_, code)) = url.query_pairs().find(|(key, _)| key == "code") {
                        let code = code.to_string();

                        // Spawn a new async task to handle the authentication
                        // because `authenticate`` is blocking
                        tauri::async_runtime::spawn(async move {
                            // Handle the window close and authentication sequentially
                            let result = match window.close() {
                                Ok(_) => {
                                    // Now that the window is closed, try to authenticate asynchronously
                                    let default = Client::default();
                                    ms_authenticate(code, &default)
                                        .await
                                        .map_err(crate::Error::Launcher)
                                }
                                Err(err) => Err(crate::Error::Tauri(err)),
                            };

                            // Send the result through the channel and handle send errors
                            if let Err(send_err) = tx.send(result).await {
                                log::error!("Unable to send authentication result: {:?}", send_err);
                            }
                        });
                    }
                } else {
                    // Microsoft authentication writes error messages to the body
                    // Since we can't read the body we just throw an exception.
                    tauri::async_runtime::spawn(async move {
                        let result = match window.close() {
                            Ok(_) => Err(crate::Error::General(
                                "Unable to authenticate user.".to_string(),
                            )),
                            Err(err) => Err(crate::Error::Tauri(err)),
                        };

                        if let Err(send_err) = tx.send(result).await {
                            log::error!("Unable to send authentication result: {:?}", send_err);
                        }
                    });
                }
            }
        }
    })
    .build()
    .map_err(crate::Error::Tauri)?;

    // Wait for the result from the channel
    match rx.recv().await {
        Some(Ok(online)) => Ok(online),
        Some(Err(err)) => Err(err),
        None => Err(crate::Error::General(
            "Authentication channel closed unexpectedly".into(),
        )),
    }
}

#[tauri::command]
pub async fn verify(app: AppHandle, exp: u64, refresh_token: String) -> Option<MinecraftAccount> {
    let request = app.state::<AppState>().request.clone();
    if !lyceris::auth::microsoft::validate(exp) {
        lyceris::auth::microsoft::refresh(refresh_token, &request)
            .await
            .ok()
    } else {
        None
    }
}
