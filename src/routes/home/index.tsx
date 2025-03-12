import { createFileRoute } from "@tanstack/react-router";
import NewsSection from "../../components/news";
import { useOptions } from "../../store/options";
import useRemote from "../../store/remote";
import { useAuth } from "../../store/auth";
import { useState } from "react";
import { clearLoading, setLoading } from "../../components/loading";
import Alert from "../../components/alert";
import { create } from "zustand";
import Mods from "../../components/mods";

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
function RouteComponent() {
  const [modsModal, setModsModal] = useState(false);
  const remote = useRemote();
  const disabled = useDisabled();
  const auth = useAuth();
  return (
    <>
      <section className="flex relative size-full p-12 gap-4 rounded-xl backdrop-blur-sm bg-body/80">
        <div className="flex w-max flex-col min-w-[24rem]">
          <img
            src="/images/logo.png"
            className="h-32 inline-block aspect-square max-w-max"
            alt=""
          />
          <h1 className="text-4xl font-bold">Phynaria MC</h1>
          <p>
            {remote.description ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."}
          </p>
          <div className="flex w-4/5 gap-2 mt-4">
            <button
              disabled={disabled.disabled}
              onClick={async () => {
                try {
                  setLoading("Please wait!", "Launching game...");
                  if (!auth.isLogged()) return;
                  setLoading("Please wait!", "Launching game...");
                  disabled.setDisabled(true);
                  // await invoke("launch", {
                  //   config: {
                  //     authentication: {
                  //       Online: auth.user,
                  //     },
                  //     root_path: options.gameLocation,
                  //     version:
                  //       remote.modApi.toUpperCase() === "NONE"
                  //         ? {
                  //             Release: remote.gameVersion
                  //               .split(".")
                  //               .map((e: string) => parseInt(e)),
                  //           }
                  //         : {
                  //             Custom:
                  //               remote.modApi.toUpperCase() === "FABRIC"
                  //                 ? {
                  //                     Fabric: {
                  //                       version: remote.gameVersion
                  //                         .split(".")
                  //                         .map((e: string) => parseInt(e)),
                  //                       loader_version: remote.modApiVersion,
                  //                     },
                  //                   }
                  //                 : {
                  //                     Quilt: {
                  //                       version: remote.gameVersion
                  //                         .split(".")
                  //                         .map((e: string) => parseInt(e)),
                  //                       loader_version: remote.modApiVersion,
                  //                     },
                  //                   },
                  //           },
                  //     instance_name: `elesya`,
                  //     version_name: remote.gameVersion,
                  //     memory: {
                  //       Megabyte: [options.memory, options.memory],
                  //     },
                  //     java_version: "Delta",
                  //     java_path: `${options.gameLocation}/runtime`,
                  //     custom_java_args: [],
                  //     custom_launch_args: [
                  //       "--quickPlayMultiplayer",
                  //       `${remote.serverIp}:${remote.serverPort}`,
                  //     ],
                  //   },
                  //   remote: { ...remote },
                  // });
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
              className={`px-3.5 py-1.5 w-full cursor-pointer ease-smooth duration-200 hover:saturate-150 gap-3 bg-primary rounded-lg flex items-center justify-center ${
                disabled.disabled && "brightness-50 cursor-not-allowed"
              }`}>
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
        <div className="w-1/2 rounded ml-auto overflow-clip aspect-video shrink-0">
          <iframe
            className="size-full pointer-events-none opacity-0 scale-90 blur-2xl ease-in-out duration-500"
            onLoad={(e) => {
              e.currentTarget.classList.remove(
                "opacity-0",
                "scale-90",
                "blur-2xl",
                "pointer-events-none"
              );
            }}
            src={remote.videoUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
        </div>
      </section>
      <section className="w-full rounded-xl backdrop-blur-sm relative h-64 gap-1 bg-body/80 mt-auto flex flex-col p-4">
        <NewsSection />
      </section>
      <Mods show={modsModal} close={() => setModsModal(false)} />
    </>
  );
}
