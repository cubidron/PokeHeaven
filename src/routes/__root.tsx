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

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  const db = useDb();
  const auth = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      await db.init();
      await auth.init();
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
      <Helmet>
        <style>{`
    html,
    body,
    #app {
      padding: 0;
      border: 0;
      margin: 0;
      contain: content;
      background-color: black;
      background: black;
      transition: background, background-color 0.3s;
      transition-timing-function: ease-in-out;
      min-height:100svh;
      overflow: hidden;
      border-radius: ${platform() == "macos" ? 10 : 8}px;
    }
  `}</style>
      </Helmet>
      {/* <input
        type="text"
        name="url"
        className="fixed inset-0 mx-auto mt-14 z-50 w-96 h-8 rounded-md outline-1 -outline-offset-1 outline-white/24 px-3 !bg-primary/6"
        value={location.href}
        onChange={(e) => {
          nav({
            to: e.target.value,
          });
        }}
      /> */}
      <div className="size-full">
        <Outlet />
      </div>
    </>
  );
}
