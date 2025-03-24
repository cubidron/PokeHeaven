import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../store/auth";
import useNewses from "../store/news";
import { clearLoading, setLoading, useLoading } from "../components/loading";
import useRemote from "../store/remote";
import { useOptions } from "../store/options";
import { load, Store } from "@tauri-apps/plugin-store";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { error, info } from "@tauri-apps/plugin-log";
import { start } from "tauri-plugin-drpc";
import { initializeDiscordState } from "../helpers";
import { DISCORD_CLIENT_ID } from "../constants";
import Alert from "../components/alert";
import { check } from "@tauri-apps/plugin-updater"
import { relaunch } from "@tauri-apps/plugin-process"

export let storage: Store | undefined;

export const Route = createRootRoute({
  component: RootComponent,
});

const disableShortcuts = (event: KeyboardEvent) => {
  if (
    (event.ctrlKey && event.code === "KeyQ") ||
    (event.ctrlKey && event.code === "KeyP") ||
    (event.ctrlKey && event.code === "KeyF") ||
    event.code === "F5"
  ) {
    event.preventDefault();
  }
};
const disableContextMenu = (e: MouseEvent) => e.preventDefault();
const disableCombinationClicks = (e: MouseEvent) => {
  if (e.ctrlKey || e.altKey) {
    e.preventDefault();
  }
};

function RootComponent() {
  const location = useLocation();
  const auth = useAuth();
  const nav = useNavigate();
  const remote = useRemote();
  const news = useNewses();
  const options = useOptions();

  useEffect(() => {
    info("Mounting root component");
    let unlisten: UnlistenFn[] | undefined;
    (async () => {
      try {
        info("Checking updates");
        const update = await check();
        if (update) {
          info(
            `found update ${update.version} from ${update.date} with notes ${update.body}`
          );
          let downloaded = 0;
          let contentLength = 0;
          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case 'Started':
                contentLength = event.data.contentLength!;
                setLoading("Mise à jour", "Téléchargement de la mise à jour...");
                break;
              case 'Progress':
                downloaded += event.data.chunkLength;
                useLoading.setState({
                  currentProgress: downloaded,
                  maxProgress: contentLength
                })
                break;
              case 'Finished':
                break;
            }
          });

          return await relaunch();
        }
        info("Loading storage");
        storage = await load("storage.json", { autoSave: true });
        setLoading("Veuillez patienter", "Chargement des paramètres...");
        await options.init();
        setLoading(
          "Veuillez patienter",
          "Initialisation de l'authentification..."
        );
        await auth.init();
        // if (useAuth.getState().user && useAuth.getState().users.length > 0) {
        //   location.href.includes("/home") ||
        //     nav({
        //       to: "/home",
        //     });
        // }
        nav({
          to: "/home",
        });
        setLoading("Veuillez patienter", "Récupération des actualités...");
        await news.fetch();
        setLoading("Veuillez patienter", "Récupération à distance...");
        await remote.init();
        if (useOptions.getState().discordRpc) {
          try {
            info("Initializing Discord RPC");
            await start(remote.discordRpc?.clientId || DISCORD_CLIENT_ID);
            await initializeDiscordState(useRemote.getState().discordRpc!);
            info("Discord RPC initialized");
          } catch (e: any) {
            error(
              `Error initializing Discord RPC: ${typeof e === "string" ? e : e?.message}`
            );
          } // Ignore error.
        }
        setLoading("Veuillez patienter", "Finalisation...");
        unlisten = [
          await listen("progress", (event: {
            payload: { current: number; total: number, path: string, fileType: string };
          }) => {
            let subText;
            switch (event.payload.fileType) {
              case "Asset":
                subText = `Téléchargement des assets...`;
                break;
              case "Library":
                subText = `Téléchargement des bibliothèques...`;
                break;
              case "Java":
                subText = `Téléchargement de Java...`;
                break;
              case "Custom":
                subText = `Téléchargement de fichiers personnalisés...`;
                break;
            }

            useLoading.setState({
              currentProgress: event.payload.current,
              maxProgress: event.payload.total,
              subText
            });
          }),
          await listen("clear-loading", (_) => {
            clearLoading();
          }),
          await listen("crash", (event: any) => {
            Alert({ title: event.payload.title, message: event.payload.message });
          })
        ];
        clearLoading();
      } catch (e: any) {
        error(
          `Error initializing frontend: ${typeof e === "string" ? e : e?.message}`
        );
        return Alert({
          title: "Erreur",
          message:
            "Une erreur s'est produite lors de l'initialisation. Veuillez réessayer ou contacter le support.",
          force: true,
          bg: true,
          action() {
            window.location.reload();
          },
        });
      }
    })();

    window.addEventListener("contextmenu", disableContextMenu);
    window.addEventListener("keydown", disableShortcuts);
    window.addEventListener("click", disableCombinationClicks);

    return () => {
      unlisten?.map((fn) => fn());
      window.removeEventListener("contextmenu", disableContextMenu);
      window.removeEventListener("keydown", disableShortcuts);
      window.removeEventListener("click", disableCombinationClicks);
    };
  }, []);

  // useEffect(() => {
  //   if (!useAuth.getState().user) {
  //     location.href.includes("/onboard") ||
  //       nav({
  //         to: "/onboard",
  //       });
  //   }else {
  //     location.href.includes("/home") ||
  //       nav({
  //         to: "/home",
  //       });
  //   }
  // }, [useAuth.getState().user]);
  return (
    <>
      <div className="size-full">
        <Outlet />
      </div>
    </>
  );
}
