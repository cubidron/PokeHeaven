import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../store/auth";
import useNewses from "../store/news";
import { clearLoading, setLoading } from "../components/loading";
import useMods from "../store/mods";
import useRemote from "../store/remote";
import { useOptions } from "../store/options";
import { load, Store } from "@tauri-apps/plugin-store";

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
    (async () => {
      try {
        storage = await load('storage.json', { autoSave: true });
        setLoading("Please wait", "Loading settings...");
        await options.init();
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
        clearLoading();
      } catch (error) {
        console.error(error);
      }
    })();

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
