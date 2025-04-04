import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { platform } from "@tauri-apps/plugin-os";
import { TitleButtons } from "../../components/tauri/TitleBar";
import { useState } from "react";
import { useOptions } from "../../store/options";
import Account from "../../components/Account";
import Skin from "../../components/Skin";
export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

export const stage = 4;

function RouteComponent() {
  const location = useLocation();
  const router = useRouter();
  const options = useOptions();
  const [skinModal, setSkinModal] = useState(false);
  const paths = location.pathname.split("/");
  const frenchPages = {
    Home: "Accueil",
    Settings: "Paramètres",
  };
  return (
    <>
      <div className="flex bg-black/20 contain-content w-full h-svh overflow-clip p-1.5 flex-col relative max-h-svh">
        <span className="absolute inset-0 size-full bg-cover bg-center bg-[url('/images/bg.jpg')] -z-10"></span>
        <span className="absolute inset-0 size-full bg-black/20 -z-10"></span>
        <header
          data-tauri-drag-region
          className={`flex shrink-0 rounded-xl items-center p-1 gap-1 z-50 bg-body/80 backdrop-blur-2xl w-full h-14`}>
          <span
            className={`flex gap-1 items-center h-full ${platform() == "macos" ? "mr-auto" : "ml-auto order-last flex-row-reverse"}`}>
            <TitleButtons className={`z-50 relative px-2`} />
            <span className="flex gap-1 h-full">
              <button
                onClick={() => {
                  router.history.back();
                }}
                className="flex items-center hover:bg-white/5 ease-smooth duration-200 px-2 rounded-lg h-full w-max">
                <svg
                  width="9"
                  height="14"
                  className="rotate-180"
                  viewBox="0 0 9 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 7C8 6.90104 7.98177 6.8099 7.94531 6.72656C7.90885 6.63802 7.85417 6.55729 7.78125 6.48438L1.58594 0.421875C1.44531 0.286458 1.27604 0.21875 1.07812 0.21875C0.942708 0.21875 0.822917 0.25 0.71875 0.3125C0.609375 0.375 0.523438 0.460938 0.460938 0.570312C0.393229 0.674479 0.359375 0.794271 0.359375 0.929688C0.359375 1.1224 0.429688 1.29167 0.570312 1.4375L6.25781 7L0.570312 12.5625C0.429688 12.7083 0.359375 12.8776 0.359375 13.0703C0.359375 13.2057 0.393229 13.3255 0.460938 13.4297C0.523438 13.5391 0.609375 13.625 0.71875 13.6875C0.822917 13.75 0.942708 13.7812 1.07812 13.7812C1.27604 13.7812 1.44531 13.7109 1.58594 13.5703L7.78125 7.51562C7.85417 7.44271 7.90885 7.36458 7.94531 7.28125C7.98177 7.19271 8 7.09896 8 7Z"
                    fill="white"
                    fill-opacity="0.5"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  router.history.forward();
                }}
                className="flex items-center hover:bg-white/5 ease-smooth duration-200 px-2 rounded-lg h-full w-max">
                <svg
                  width="9"
                  height="14"
                  viewBox="0 0 9 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 7C8 6.90104 7.98177 6.8099 7.94531 6.72656C7.90885 6.63802 7.85417 6.55729 7.78125 6.48438L1.58594 0.421875C1.44531 0.286458 1.27604 0.21875 1.07812 0.21875C0.942708 0.21875 0.822917 0.25 0.71875 0.3125C0.609375 0.375 0.523438 0.460938 0.460938 0.570312C0.393229 0.674479 0.359375 0.794271 0.359375 0.929688C0.359375 1.1224 0.429688 1.29167 0.570312 1.4375L6.25781 7L0.570312 12.5625C0.429688 12.7083 0.359375 12.8776 0.359375 13.0703C0.359375 13.2057 0.393229 13.3255 0.460938 13.4297C0.523438 13.5391 0.609375 13.625 0.71875 13.6875C0.822917 13.75 0.942708 13.7812 1.07812 13.7812C1.27604 13.7812 1.44531 13.7109 1.58594 13.5703L7.78125 7.51562C7.85417 7.44271 7.90885 7.36458 7.94531 7.28125C7.98177 7.19271 8 7.09896 8 7Z"
                    fill="white"
                    fill-opacity="0.5"
                  />
                </svg>
              </button>
            </span>
            <nav className="flex items-center hover:bg-white/5 ease-smooth duration-200 px-2 rounded-lg h-full w-max">
              {paths.length === 2 && paths[1] === "" ? (
                <span className="font-medium">Accueil</span>
              ) : (
                paths
                  .filter((item) => item !== "")
                  .map((item, i) => {
                    const path = `/${paths.slice(1, i + 2).join("/")}`;
                    return (
                      <span key={i} className="flex items-center">
                        <Link
                          to={path}
                          className="font-medium hover:text-primary ease-gentle duration-200 px-1.5"
                          draggable={false}>
                          {
                            // @ts-ignore
                            frenchPages[
                              item.charAt(0).toUpperCase() + item.slice(1)
                            ] || item.charAt(0).toUpperCase() + item.slice(1)
                          }
                        </Link>
                        {i != paths.length - 2 && (
                          <span className="mx-0">/</span>
                        )}
                      </span>
                    );
                  })
              )}
            </nav>
          </span>
          <Account setSkinModal={setSkinModal} />
          <Hd />
          <Link
            to="/home"
            className="flex items-center hover:bg-white/5 ease-smooth duration-200 px-4 rounded-lg h-full w-max"
            draggable={false}>
            Accueil
          </Link>
          <Link
            to="/home/settings"
            className="flex items-center hover:bg-white/5 ease-smooth duration-200 px-4 rounded-lg h-full w-max"
            draggable={false}>
            Paramètres
          </Link>
        </header>
        <main className="h-full flex shrink flex-col gap-2 py-2 relative">
          <Outlet />
        </main>
        <footer className="w-full shrink-0 relative flex items-center h-8 bg-body/80 backdrop-blur-2xl pr-3 rounded-lg">
          <img
            src="/images/logo.png"
            className="h-full aspect-square w-auto object-contain py-1"
            alt=""
          />
          <p className="text-xs">
            PokeHeaven{" "}
            <span className="text-white/50">
              {" "}
              • Non affilié à Mojang Studios
            </span>
          </p>
          <div className="text-xs absolute inset-0 size-max m-auto text-white/50">
            version {options.version!}
          </div>
          <p className="text-xs ml-auto text-white/50">
            powered by{" "}
            <a
              href="https://cubidron.com"
              target="_blank"
              className="font-medium hover:underline hover:text-primary">
              Cubidron
            </a>
          </p>
        </footer>
      </div>
      {skinModal && (
        <span
          onClick={() => {
            setSkinModal(false);
          }}
          className=" fixed inset-0 size-full bg-black/60 z-50 flex items-center justify-center">
          <Skin setSkinModal={setSkinModal} />
        </span>
      )}
    </>
  );
}

function Hd() {
  return <div className="h-4/5 w-0.5 mx-1 rounded-full bg-white/6"></div>;
}
