use std::path::PathBuf;

use lyceris::minecraft::{config::Profile, emitter::Emitter as LycerisEmitter};
use serde::{Deserialize, Serialize};
use tauri::Emitter;
use tauri::{AppHandle, Runtime, State, Window};
use tauri_plugin_store::{Store, StoreExt};

use crate::AppState;

#[derive(Serialize, Deserialize)]
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
    memory: u16,
    fullscreen: bool,
}

#[derive(Serialize, Deserialize)]
pub struct MinecraftConfig {
    version: String,
    loader: LoaderConfig,
    exclude: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct LoaderConfig {
    r#type: String,
    version: String,
}

#[tauri::command]
pub async fn launch(window: Window, state: State<'_, AppState>, cfg: Config) -> crate::Result<()> {
    let game_dir = PathBuf::from(cfg.game_dir);

    let cfg = lyceris::minecraft::config::Config {
        game_dir: game_dir.clone(),
        profile: Some(Profile {
            name: cfg.profile,
            root: game_dir.join("profiles"),
        }),
        version: cfg.minecraft.version,
        authentication: lyceris::auth::AuthMethod::Offline {
            username: cfg.username,
            uuid: None,
        },
        memory: Some(lyceris::minecraft::config::Memory::Gigabyte(cfg.memory)),
        version_name: None,
        loader: Some(get_loader_by(
            &cfg.minecraft.loader.r#type,
            &cfg.minecraft.loader.version,
        )),
        client: Some(state.request.clone()),
        java_version: None,
        runtime_dir: None,
        custom_java_args: vec![],
        custom_args: if cfg.fullscreen {
            vec!["--fullscreen".to_string()]
        } else {
            vec![]
        },
    };

    let emitter = LycerisEmitter::default();

    emitter
        .on(
            lyceris::minecraft::emitter::Event::MultipleDownloadProgress,
            move |(_, current, total): (String, u64, u64)| {
                #[derive(Clone, Serialize, Deserialize)]
                struct Payload {
                    current: u64,
                    total: u64,
                }
                window.emit("progress", Payload { current, total }).ok();
            },
        )
        .await;

    lyceris::minecraft::install::install(&cfg, Some(&emitter)).await?;

    let mut child = lyceris::minecraft::launch::launch(&cfg, Some(&emitter)).await?;

    child.wait().await.unwrap();

    Ok(())
}

fn get_loader_by(r#type: &str, version: &str) -> Box<dyn lyceris::minecraft::loader::Loader> {
    match r#type {
        "fabric" => Box::new(lyceris::minecraft::loader::fabric::Fabric(
            version.to_string(),
        )),
        "forge" => Box::new(lyceris::minecraft::loader::forge::Forge(
            version.to_string(),
        )),
        "neoforge" => Box::new(lyceris::minecraft::loader::neoforge::NeoForge(
            version.to_string(),
        )),
        "quilt" => Box::new(lyceris::minecraft::loader::quilt::Quilt(
            version.to_string(),
        )),
        _ => panic!("Unknown loader type: {}", r#type),
    }
}
