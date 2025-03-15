import { createFileRoute } from "@tanstack/react-router";
import NewsSection from "../../components/news";
import useRemote from "../../store/remote";
import React, { useState } from "react";
import { clearLoading } from "../../components/loading";
import Alert from "../../components/alert";
import { create } from "zustand";
import Mods from "../../components/mods";
import Spinner from "../../components/Spinner";
import { AnimatePresence, motion } from "motion/react";
import DragWrapper from "../../components/DragWrapper";

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
  //const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<string>("phynariamc2");

  return (
    <>
      <span className="flex h-12 shrink-0 relative rounded-xl backdrop-blur-sm bg-body/80">
        <DragWrapper rootClass="border-2 border-red-500">
          <ul className="h-full grid grid-flow-col w-full max-w-full border-2 border-blue-500 relative p-1 hidden-scroll grid-rows-1 gap-1 overflow-x-auto overflow-y-hidden">
            {remote?.servers?.map((server) => (
              <div
                // onClick={() => setSelectedServer(server.profile || "")}
                className={`shrink-0 flex pointer-events-none outline-none w-56 items-center justify-center hover:bg-white/5 ease-smooth duration-200 rounded-lg ${
                  selectedServer === server.profile
                    ? "text-white bg-white/5"
                    : " opacity-40 mix-blend-luminosity"
                }`}>
                <img
                  src={server.icon || "/images/logo.png"}
                  className="h-full p-1 inline-block aspect-square max-w-max"
                  alt=""
                />
                <h1
                  title={server.serverName}
                  className="text-sm font-medium text-ellipsis line-clamp-1">
                  {server.serverName || "Unnamed Server"}
                </h1>
              </div>
            ))}
          </ul>
        </DragWrapper>
      </span>
      <section className="flex relative size-full overflow-clip max-h-full contain-strict p-8 gap-4 rounded-xl backdrop-blur-sm bg-body/80">
        <AnimatePresence mode="wait">
          {remote.servers &&
            remote.servers
              .filter((server) => server.profile === selectedServer)
              .map((server) => (
                <motion.span
                  key={server.serverName}
                  initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
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
                      {server.serverName || "Unnamed Server"}
                    </h1>
                    <p>
                      {server.description ||
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
                    </p>
                    <div className="flex w-4/5 gap-2 mt-4">
                      <button
                        disabled={disabled.disabled}
                        onClick={async () => {
                          try {
                            disabled.setDisabled(false);
                          } catch (err: any) {
                            if (!err.message && err.includes("[Minecraft]")) {
                              Alert({
                                title: "Error",
                                message: `Your game crashed! If the issue persist please contact with support.`,
                              });
                            } else {
                              Alert({
                                title: "Error",
                                message: `There was an error during game launch. Please try again or contact with support.`,
                              });
                            }
                          } finally {
                            clearLoading();
                            disabled.setDisabled(false);
                          }
                        }}
                        className={`px-3.5 py-1.5 w-full cursor-pointer ease-smooth duration-200 hover:saturate-150 gap-3 bg-primary rounded-lg flex items-center justify-center ${disabled.disabled && "brightness-50 cursor-not-allowed"}`}>
                        Launch
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
                      <div className="flex absolute flex-col items-center gap-4 h-full m-auto inset-0 justify-center">
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
      <Mods show={modsModal} close={() => setModsModal(false)} />
    </>
  );
}
