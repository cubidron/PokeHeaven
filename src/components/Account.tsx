import { Link } from "@tanstack/react-router";
import { platform } from "@tauri-apps/plugin-os";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import Alert from "./alert";
import { WEB_API_BASE } from "../constants";

export default function Account(props: {
  setSkinModal: (value: boolean) => void;
}) {
  const auth = useAuth();
  const [accountModal, setAccountModal] = useState(false);
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
    <>
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
                src={`${WEB_API_BASE}/skin-api/avatars/face/${auth?.user?.username || "MHF_Steve"}`}
                onError={(e) => {
                  const a = "https://vzge.me/face/MHF_Steve";
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
              <h1 className="text-xl font-medium text-center">Comptes</h1>
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
                        src={`${WEB_API_BASE}/skin-api/avatars/face/${account.username}`}
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
                            Alert({
                              title: "Changer de compte",
                              message: `Êtes-vous sûr de vouloir changer de compte pour ${account.username} ?`,
                              action: async () => {
                                auth.switch(account);
                              },
                            });
                        }}
                        className={`button shrink-0 hover:bg-white/5 rounded-lg ease-smooth duration-200 px-2 py-1 overflow-hidden relative ${
                          auth?.user?.username === account.username
                            ? "hover:bg-dark cursor-default"
                            : ""
                        }`}>
                        <p>Changer</p>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        account.username &&
                          Alert({
                            title: "Supprimer le compte",
                            message: `Êtes-vous sûr de vouloir supprimer le compte ${account.username} ?`,
                            action: () => {
                              auth.logout(account);
                            },
                          });
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
                <span className="flex gap-2">
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
                  <button
                    onClick={() => {
                      props.setSkinModal(true);
                    }}
                    className="button size-8 !p-0 grid hover:bg-white/5 rounded-lg place-items-center overflow-hidden relative">
                    <svg
                      className="w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 1024 1024">
                      <path
                        fill="currentColor"
                        d="M870 126H663.8c-17.4 0-32.9 11.9-37 29.3C614.3 208.1 567 246 512 246s-102.3-37.9-114.8-90.7a37.93 37.93 0 0 0-37-29.3H154a44 44 0 0 0-44 44v252a44 44 0 0 0 44 44h75v388a44 44 0 0 0 44 44h478a44 44 0 0 0 44-44V466h75a44 44 0 0 0 44-44V170a44 44 0 0 0-44-44"
                      />
                    </svg>
                  </button>
                </span>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </>
  );
}
