use lyceris::auth::microsoft::{
    authenticate as ms_authenticate, create_link, MinecraftAccount, AUTH_URL, REDIRECT_URI,
};
use tauri::{webview::PageLoadEvent, AppHandle, Url, WebviewUrl, WebviewWindowBuilder, Window};

static AUTHENTICATION_WINDOW_LABEL: &str = "auth";

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
                                    ms_authenticate(code).await.map_err(crate::Error::Launcher)
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
