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
import useMods from "../store/mods";
import useRemote from "../store/remote";
import { useOptions } from "../store/options";
import { load, Store } from "@tauri-apps/plugin-store";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { start } from "tauri-plugin-drpc";
import { initializeDiscordState } from "../helpers";
import { DISCORD_CLIENT_ID } from "../constants";

export let storage: Store | undefined;

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  const auth = useAuth();
  const nav = useNavigate();
  const mods = useMods();
  const remote = useRemote();
  const news = useNewses();
  const options = useOptions();

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;
    (async () => {
      try {
        storage = await load('storage.json', { autoSave: true });
        setLoading("Please wait", "Loading settings...");
        await options.init();
        if (useOptions.getState().discordRpc) {
          try {
            console.log("Starting Discord RPC");
            await start(DISCORD_CLIENT_ID);
            
          } catch (error) {} // Ignore error.
          await initializeDiscordState();
        }
        setLoading("Please wait", "Initializing authentication...");
        await auth.init();
        if (useAuth.getState().user && useAuth.getState().users.length > 0) {
          location.href.includes("/home") ||
            nav({
              to: "/home",
            });
        }
        setLoading("Please wait", "Fetching news...");
        await news.fetch();
        setLoading("Please wait", "Fetching remote...");
        await remote.init();
        setLoading("Please wait", "Fetching mods...");
        await mods.fetch();
        setLoading("Please wait", "Finishing...");
        unlisten = await listen("progress", (event: any) => {
          console.log(event.payload)
          useLoading.setState({
            currentProgress: event.payload.current,
            maxProgress: event.payload.max,
          });
        });

        clearLoading();
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      unlisten?.();
    }
  }, []);

  useEffect(() => {
    if (!useAuth.getState().user) {
      location.href.includes("/onboard") ||
        nav({
          to: "/onboard",
        });
    }
  }, [useAuth.getState()]);
  return (
    <>
      <div className="size-full">
        <Outlet />
      </div>
    </>
  );
}
