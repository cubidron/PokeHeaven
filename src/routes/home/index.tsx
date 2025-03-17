import { createFileRoute } from "@tanstack/react-router";
import NewsSection from "../../components/news";
import useRemote from "../../store/remote";
import React, { useState, useCallback } from "react";
import { clearLoading, useLoading } from "../../components/loading";
import Alert from "../../components/alert";
import { create } from "zustand";
import Mods from "../../components/mods";
import Spinner from "../../components/Spinner";
import { AnimatePresence, motion } from "motion/react";
import DragWrapper from "../../components/DragWrapper";
import { useOptions } from "../../store/options";
import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "../../store/auth";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

const useDisabled = create<{
  disabled: boolean;
  setDisabled: (state: boolean) => void;
}>((set) => ({
  disabled: false,
  setDisabled: (state: boolean) => set({ disabled: state }),
}));

const YoutubeIFrame = React.memo(
  ({ source, onFinish }: { source: string; onFinish: () => void }) => (
    <iframe
      className="size-full pointer-events-none opacity-0 scale-90 blur-2xl ease-in-out duration-500"
      onLoad={(e) => {
        e.currentTarget.classList.remove(
          "opacity-0",
          "scale-90",
          "blur-2xl",
          "pointer-events-none"
        );
        onFinish();
      }}
      src={source}
      title=""
      sandbox="allow-scripts allow-same-origin"
    />
  )
);

function RouteComponent() {
  const [modsModal, setModsModal] = useState(false);
  const remote = useRemote();
  const disabled = useDisabled();
  const [loading, setLoading] = useState(true);
  const options = useOptions();
  const auth = useAuth();
  const mainLoading = useLoading();

  const handleServerClick = useCallback(
    (server: any) => {
      options.set({ selectedServer: server.profile });
      setLoading(true);
    },
    [options]
  );


  const selectedServer =
    options.selectedServer !== undefined
      ? options.selectedServer
      : remote?.servers?.[0]?.profile;

  const optionalMods = remote.servers
    ?.find((s) => s.profile === selectedServer)
    ?.minecraft?.optionalMods.map((om) => {
      om.enabled = options.optionalMods?.find(
        (om2) => om2.fileName === om.fileName && om2.profile === selectedServer,
      )?.enabled ?? om.default;
      return om;
    }) || [];

  const handleLaunchClick = useCallback(
    async (server: any) => {
      try {
        disabled.setDisabled(true);
        mainLoading.set("Veuillez patienter", "Lancement du jeu...");
        await invoke("launch", {
          cfg: {
            username: auth.user?.username,
            title: server.title,
            profile: server.profile,
            version: server.version,
            ip: server.ip,
            port: server.port,
            memory: options.maxMemory,
            fullscreen: options.fullScreen,
            gameDir: options.appDir,
            minecraft: server.minecraft,
            after: options.launchBehavior,
            optionalMods
          },
        });
        mainLoading.clear();
      } catch (err: any) {
        console.error(err);
        Alert({
          title: "Erreur",
          message:
            err.message ||
            "Une erreur s'est produite lors du lancement du jeu. Veuillez réessayer ou contacter le support.",
        });
      } finally {
        clearLoading();
        disabled.setDisabled(false);
      }
    },
    [auth, disabled, mainLoading, options]
  );

  return (
    <>
      <span className="flex h-12 shrink-0 relative rounded-xl backdrop-blur-sm bg-body/80 w-full">
        <DragWrapper rootClass="w-full">
          <ul className="h-full grid grid-flow-col !scroll-auto w-full max-w-full relative p-1 hidden-scroll grid-rows-1 gap-1 overflow-x-auto overflow-y-hidden">
            {remote?.servers?.map((server) => (
              <div
                key={server.profile}
                onClick={(e) => {
                  e.stopPropagation();
                  handleServerClick(server);
                }}
                className={`shrink-0 flex outline-none w-56 items-center justify-center hover:bg-white/5 ease-smooth duration-200 rounded-lg ${selectedServer === server.profile
                  ? "text-white bg-white/5"
                  : "opacity-40 mix-blend-luminosity"
                  }`}>
                <img
                  src={server.icon || "/images/logo.png"}
                  className="h-full p-1 pointer-events-none inline-block aspect-square max-w-max"
                  alt=""
                />
                <h1
                  title={server.serverName}
                  className="text-sm font-medium text-ellipsis line-clamp-1">
                  {server.serverName || "Serveur sans nom"}
                </h1>
              </div>
            ))}
          </ul>
        </DragWrapper>
      </span>
      <section className="flex relative size-full overflow-clip max-h-full contain-strict p-8 gap-4 rounded-xl backdrop-blur-sm bg-body/80">
        <AnimatePresence mode="wait">
          {remote.servers
            ?.filter((server) => server.profile === selectedServer)
            .map((server) => (
              <motion.span
                key={server.serverName}
                initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="flex w-full gap-4 items-center justify-center">
                <div className="flex w-full flex-col min-w-[24rem]">
                  <img
                    src={server.icon || "/images/logo.png"}
                    className="h-32 inline-block aspect-square max-w-max"
                    alt=""
                  />
                  <h1
                    title={server.serverName}
                    className="text-3xl w-full font-bold text-ellipsis line-clamp-1">
                    {server.serverName || "Serveur sans nom"}
                  </h1>
                  <p>
                    {server.description ||
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
                  </p>
                  <div className="flex w-4/5 gap-2 mt-4">
                    <button
                      disabled={disabled.disabled}
                      onClick={() => handleLaunchClick(server)}
                      className={`px-3.5 py-1.5 w-full cursor-pointer ease-smooth duration-200 hover:saturate-150 gap-3 bg-primary rounded-lg flex items-center justify-center ${disabled.disabled && "brightness-50 cursor-not-allowed"
                        }`}>
                      Lancer
                    </button>
                    <button
                      onClick={() => setModsModal(true)}
                      className="h-10 aspect-square shrink-0 cursor-pointer ease-smooth duration-200 hover:saturate-150 bg-dark hover:bg-primary rounded-lg flex items-center justify-center">
                      <svg
                        className="h-5"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M0 0H4.5V4.5H0V0ZM0 6.75H4.5V11.25H0V6.75ZM4.5 13.5H0V18H4.5V13.5ZM6.75 0H11.25V4.5H6.75V0ZM11.25 6.75H6.75V11.25H11.25V6.75ZM6.75 13.5H11.25V18H6.75V13.5ZM18 0H13.5V4.5H18V0ZM13.5 6.75H18V11.25H13.5V6.75ZM18 13.5H13.5V18H18V13.5Z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="w-1/2 shrink-0 rounded relative justify-center flex flex-col size-full h-full items-center overflow-clip aspect-video">
                  {loading && (
                    <div className="flex absolute -z-10 flex-col items-center gap-4 h-full m-auto inset-0 justify-center">
                      <Spinner className="!h-24" />
                    </div>
                  )}
                  <YoutubeIFrame
                    source={server.videoUrl || ""}
                    onFinish={() => setLoading(false)}
                  />
                </div>
              </motion.span>
            ))}
        </AnimatePresence>
      </section>
      <section className="w-full rounded-xl backdrop-blur-sm relative h-64 gap-1 bg-body/80 mt-auto flex flex-col p-4">
        <NewsSection />
      </section>
      <Mods
        show={modsModal}
        close={() => setModsModal(false)}
        mods={optionalMods}
      />
    </>
  );
}
