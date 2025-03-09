import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { platform } from "@tauri-apps/plugin-os";
// const platform = () => "windows";
import { DragRegion, TitleButtons } from "../../components/tauri/TitleBar";
import { AnimatedOutlet } from "../../components/AOutlet";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../../store/auth";
import { useEffect, useState } from "react";
export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

export const stage = 4;

function RouteComponent() {
  const location = useLocation();
  const auth = useAuth();
  const router = useRouter();
  const [accountModal, setAccountModal] = useState(false);
  const paths = location.pathname.split("/");
  // Click outside modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`.accountModal`)) {
        setAccountModal(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return (
    <div className="flex bg-black/20 w-full h-svh overflow-y-auto p-2 flex-col">
      <span className="absolute inset-0 size-full bg-cover bg-center bg-[url('/images/bg.png')] -z-10"></span>
      <span className="absolute inset-0 size-full bg-black/60 -z-10"></span>
      <header
        data-tauri-drag-region
        className={`flex rounded-xl items-center p-1 gap-1 z-50 bg-body w-full h-14`}>
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
              <span className="font-medium">Home</span>
            ) : (
              paths
                .filter((item) => item !== "")
                .map((item, i) => {
                  const path = `/${paths.slice(1, i + 2).join("/")}`;
                  return (
                    <span key={i} className="flex items-center">
                      <Link
                        to={path}
                        className="font-medium hover:text-primary ease-gentle duration-200 px-1.5">
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </Link>
                      {i != paths.length - 2 && <span className="mx-0">/</span>}
                    </span>
                  );
                })
            )}
          </nav>
        </span>
        <span className={`relative h-full`}>
          <AnimatePresence>
            <motion.button
              onClick={() => setAccountModal(!accountModal)}
              layout
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              className={`shrink-0 accountModal relative rounded-lg px-2 overflow-clip flex h-full`}>
              <motion.span
                className="flex items-center relative h-8 m-auto gap-2"
                key={auth?.user?.username}
                layout="position"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}>
                <div id="user-head" className="bg-side size-8 rounded"></div>
                <img
                  onLoad={(e) => {
                    document.getElementById("user-head")?.remove();
                    e.currentTarget.classList.remove("hidden");
                  }}
                  src={`https://visage.surgeplay.com/face/${auth?.user?.username || "MHF_Steve"}`}
                  onError={(e) => {
                    const a = "https://visage.surgeplay.com/face/MHF_Steve";
                    if (e.currentTarget.src != a) {
                      e.currentTarget.src = a;
                    }
                  }}
                  className="h-8 hidden"
                  alt=""
                />
                <h1 className="text-white leading-4 text-xl font-medium">
                  {auth?.user?.username || "MHF_Steve"}
                </h1>
              </motion.span>
            </motion.button>
          </AnimatePresence>
          {/* Account modal */}
          <AnimatePresence>
            {accountModal && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.6,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.6,
                }}
                transition={{ duration: 0.4, ease: "backInOut" }}
                style={{
                  transformOrigin:
                    platform() == "macos" ? "right top" : "left top",
                  right: platform() == "macos" ? 0 : "auto",
                  left: platform() == "macos" ? "auto" : 0,
                }}
                className="absolute accountModal top-full mt-2 p-4 pt-2 bg-body rounded-xl w-max min-w-80 min-h-20">
                <h1 className="text-xl font-medium text-center">Accounts</h1>
                <ul className="flex flex-col gap-4 mt-2">
                  {auth.users.map((account, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <div
                        id={"user-head" + i}
                        className="bg-side size-8 rounded"></div>
                      <span className="relative">
                        <div
                          className={`size-4 rounded-full grid place-items-center absolute -right-1 -top-1 ${
                            auth?.user?.username == account.username
                              ? "bg-green-500/40"
                              : "bg-red-500/40"
                          }`}>
                          <div
                            className={`size-2 rounded-full ${
                              auth?.user?.username == account.username
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}></div>
                        </div>
                        <img
                          onLoad={(e) => {
                            document.getElementById("user-head" + i)?.remove();
                            e.currentTarget.classList.remove("hidden");
                          }}
                          src={`https://visage.surgeplay.com/face/${account.username}`}
                          onError={(e) => {
                            const a =
                              "https://visage.surgeplay.com/face/MHF_Steve";
                            if (e.currentTarget.src != a) {
                              e.currentTarget.src = a;
                            }
                          }}
                          className="h-8 hidden"
                          alt=""
                        />
                      </span>
                      <h1 className="text-white leading-4 text-xl font-medium">
                        {account.username}
                      </h1>
                      <span className="ml-auto"></span>
                      {account.username != auth?.user?.username && (
                        <button
                          onClick={async () => {
                            account.username != auth?.user?.username &&
                              auth.switch(account);
                          }}
                          className={`button shrink-0 hover:bg-white/5 rounded-lg ease-smooth duration-200 px-2 py-1 overflow-hidden relative ${
                            auth?.user?.username === account.username
                              ? "hover:bg-dark cursor-default"
                              : ""
                          }`}>
                          <p>Switch</p>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          account.username && auth.logout(account);
                        }}
                        className="button size-8 hover:bg-white/5 rounded-lg ease-smooth duration-200 px-2 py-1 grid place-items-center overflow-hidden relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5"
                          viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM7 6v13zm5 7.9l1.9 1.9q.275.275.7.275t.7-.275t.275-.7t-.275-.7l-1.9-1.9l1.9-1.9q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275L12 11.1l-1.9-1.9q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7l1.9 1.9l-1.9 1.9q-.275.275-.275.7t.275.7t.7.275t.7-.275z"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                  <Link
                    to="/onboard"
                    className="button size-8 !p-0 grid hover:bg-white/5 rounded-lg place-items-center overflow-hidden relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4"
                      viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"
                      />
                    </svg>
                  </Link>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </span>
        <Hd />
        <Link
          to="/home"
          className="flex items-center hover:bg-white/5 ease-smooth duration-200 px-4 rounded-lg h-full w-max">
          Home
        </Link>
        <Link
          to="/home/settings"
          className="flex items-center hover:bg-white/5 ease-smooth duration-200 px-4 rounded-lg h-full w-max">
          Settings
        </Link>
      </header>
      <Outlet />
    </div>
  );
}

function Hd() {
  return <div className="h-4/5 w-0.5 mx-1 rounded-full bg-white/6"></div>;
}
