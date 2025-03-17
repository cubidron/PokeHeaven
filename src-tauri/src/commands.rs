use std::path::PathBuf;
use std::sync::LazyLock;
use std::time::Duration;

use lyceris::minecraft::{config::Profile, emitter::Emitter as LycerisEmitter};
use serde::{Deserialize, Serialize};
use tauri::async_runtime::Mutex;
use tauri::{Emitter, Manager};
use tauri::{State, Window};
use tokio::process::Child;

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
    username: String,
    ip: String,
    port: u32,
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

#[tauri::command]
pub async fn launch(window: Window, state: State<'_, AppState>, cfg: Config) -> crate::Result<()> {
    log::info!(
        "Preparing launch with memory: {}, username: {}",
        cfg.memory * 512,
        cfg.username
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
        authentication: lyceris::auth::AuthMethod::Offline {
            username: cfg.username,
            uuid: None,
        },
        memory: Some(lyceris::minecraft::config::Memory::Megabyte(
            cfg.memory * 512,
        )),
        version_name: None,
        loader: Some(get_loader_by(
            &cfg.minecraft.loader.r#type,
            &cfg.minecraft.loader.version,
        )),
        client: Some(state.request.clone()),
        java_version: None,
        runtime_dir: None,
        custom_java_args: vec![],
        custom_args: {
            let mut args = if minecraft_version_separated
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
            };
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
                move |(_, current, total): (String, u64, u64)| {
                    #[derive(Clone, Serialize, Deserialize)]
                    struct Payload {
                        current: u64,
                        total: u64,
                    }
                    window.emit("progress", Payload { current, total }).ok();
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

    drop(child);

    window.emit("clear-loading", ()).ok();

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

    Ok(())
}
