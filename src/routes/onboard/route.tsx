import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { platform } from "@tauri-apps/plugin-os";
import { DragRegion, TitleButtons } from "../../components/tauri/TitleBar";
import { AnimatedOutlet } from "../../components/AOutlet";
import { AnimatePresence } from "motion/react";
export const Route = createFileRoute("/onboard")({
  component: RouteComponent,
});

export const stage = 4;

function RouteComponent() {
  const location = useLocation();
  return (
    <div className="flex bg-black/20 w-full h-svh overflow-y-auto items-center justify-center flex-col">
      <span className="absolute inset-0 size-full bg-cover bg-center bg-[url('/images/bg.png')] -z-10"></span>
      <span className="absolute inset-0 size-full bg-black/60 -z-10"></span>
      <span
        className={`absolute inset-0 size-max z-10 flex w-full ${platform() != "macos" ? "justify-end" : "p-3"}`}>
        <TitleButtons className="z-50 relative" />
        <DragRegion />
      </span>
      <section className="bg-body min-w-96 overflow-clip contain-content rounded-xl flex flex-col gap-2 p-8">
        <AnimatePresence mode="wait">
          <AnimatedOutlet
            initial={{
              x: 128,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            exit={{
              x: -128,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 200,
            }}
          />
        </AnimatePresence>
      </section>
    </div>
  );
}
