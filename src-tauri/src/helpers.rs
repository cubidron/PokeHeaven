use std::path::{PathBuf, MAIN_SEPARATOR_STR};

use serde::{Deserialize, Serialize};
use tauri_plugin_http::reqwest::Client;
use lyceris::minecraft::emitter::Emitter as LycerisEmitter;
use tokio::fs;

pub fn get_loader_by(r#type: &str, version: &str) -> Box<dyn lyceris::minecraft::loader::Loader> {
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

static LAUNCHER_BASE: &str = "https://launcher.phynaria.fr/www";

#[derive(Serialize, Deserialize, Debug)]
pub struct RemoteFile {
    path: String,
    name: String,
    hash: String,
}

pub async fn list_files_recursively(dir: PathBuf) -> crate::Result<Vec<PathBuf>> {
    let mut files = vec![];
    let mut dir_entries = fs::read_dir(&dir).await?;
    while let Some(entry) = dir_entries.next_entry().await? {
        let path = entry.path();
        if path.is_file() {
            files.push(path);
        } else if path.is_dir() {
            let mut sub_dir_files = Box::pin(list_files_recursively(path)).await?;
            files.append(&mut sub_dir_files);
        }
    }
    Ok(files)
}

pub async fn synchronize_files(
    profile_dir: PathBuf,
    profile_name: String,
    exclude: Vec<String>,
    emitter: LycerisEmitter,
    client: Client,
) -> crate::Result<()> {
    let remote_files: Vec<RemoteFile> = lyceris::http::fetch::fetch(
        format!(
            "{}/PhynariaLauncherV2/files/?directory={}",
            LAUNCHER_BASE, profile_name
        ),
        Some(&client),
    )
    .await?;

    if !profile_dir.exists() {
        fs::create_dir_all(&profile_dir).await?;
    }

    let mut local_files = vec![];
    let mut dir_entries = fs::read_dir(&profile_dir).await?;
    while let Some(entry) = dir_entries.next_entry().await? {
        let path = entry.path();
        if path.is_file() {
            local_files.push(path);
        } else if path.is_dir() {
            let mut sub_dir_files = list_files_recursively(path).await?;
            local_files.append(&mut sub_dir_files);
        }
    }

    for remote_file in &remote_files {
        let local_path = profile_dir.join(&remote_file.path);
        if !local_path.exists() {
            lyceris::http::downloader::download(
                format!(
                    "{}/PhynariaLauncherV2/files/game/{}/{}",
                    LAUNCHER_BASE, profile_name, remote_file.path
                ),
                &local_path,
                Some(&emitter),
                Some(&client),
            )
            .await?;
        } else {
            let hash = lyceris::util::hash::calculate_sha1(&local_path)?;
            if hash != remote_file.hash {
                lyceris::http::downloader::download(
                    format!(
                        "{}/PhynariaLauncherV2/files/game/{}/{}",
                        LAUNCHER_BASE, profile_name, remote_file.path
                    ),
                    &local_path,
                    Some(&emitter),
                    Some(&client),
                )
                .await?;
            }
        }
    }

    for local_file in &local_files {
        let relative_path = local_file
            .strip_prefix(&profile_dir)
            .unwrap()
            .to_str()
            .unwrap();
        if !remote_files
            .iter()
            .any(|rf| rf.path.replace("/", MAIN_SEPARATOR_STR) == relative_path)
            && !exclude
                .iter()
                .any(|e| relative_path.starts_with(&e.replace("/", MAIN_SEPARATOR_STR)))
        {
            fs::remove_file(local_file).await?;
        }
    }

    Ok(())
}