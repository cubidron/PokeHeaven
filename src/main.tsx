import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
import { Helmet } from "react-helmet";
import { platform } from "@tauri-apps/plugin-os";
import NotifyComponent from "./components/notification/Notify";
import Loading from "./components/loading/Loading";
import AlertComponent from "./components/alert/Alert";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

window.onunhandledrejection = (event) => {
  console.error(event.reason);
};

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <>
      <Helmet>
        <style>{`
          html,
          body,
          #root {
            padding: 0;
            border: 0;
            margin: 0;
            contain: content;
            background-color: transparent;
            background: transparent;
            transition: background, background-color 0.3s;
            transition-timing-function: ease-in-out;
            overflow: hidden;
            border-radius: ${platform() == "macos" ? 10 : 8}px;
          }
          
          ${
            platform() !== "macos"
              ? `
          ::-webkit-scrollbar { 
            width: 8px; 
            height: 8px; 
          }

          ::-webkit-scrollbar-track { 
            background: transparent; 
          }

          ::-webkit-scrollbar-thumb { 
            background: rgba(255, 255, 255, 0.4); 
            border-radius: 4px; 
            border: 2px solid transparent; 
            background-clip: padding-box; 
          }

          ::-webkit-scrollbar-thumb:hover { 
            background: rgba(255, 255, 255, 0.6); 
          }
          `
              : ""
          }
        `}</style>
      </Helmet>
      <RouterProvider router={router} />
      <NotifyComponent />
      <Loading />
      <AlertComponent />
    </>
  );
}
