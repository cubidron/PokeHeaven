import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { platform } from "@tauri-apps/plugin-os";
import { Helmet } from "react-helmet";
import { useDb } from "../store/db";
import { useAuth } from "../store/auth";
import useNewses from "../store/news";
import { clearLoading, setLoading } from "../components/loading";
import useMods from "../store/mods";
import useRemote from "../store/remote";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  const db = useDb();
  const auth = useAuth();
  const nav = useNavigate();
  const mods = useMods();
  const remote = useRemote();
  const news = useNewses();

  useEffect(() => {
    (async () => {
      setLoading("Please wait", "Initializing database...");
      await db.init();
      setLoading("Please wait", "Initializing authentication...");
      await auth.init();
      setLoading("Please wait", "Fetching news...");
      await news.fetch();
      setLoading("Please wait", "Fetching remote...");
      await remote.init();
      setLoading("Please wait", "Fetching mods...");
      await mods.fetch();
      setLoading("Please wait", "Finishing...");
      clearLoading();
    })();
  }, []);

  useEffect(() => {
    if (!useAuth.getState().user && useAuth.getState().users.length <= 0) {
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
