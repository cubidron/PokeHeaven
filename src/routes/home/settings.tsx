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

export const Route = createFileRoute("/home/settings")({
  component: RouteComponent,
});
function RouteComponent() {
  const remote = useRemote();
  return (
    <div className="flex gap-2 size-full">
      <section className="flex flex-col relative size-full p-6 gap-4 rounded-xl backdrop-blur-sm bg-body/80">
        <h4 className="font-extrabold mb-2">Launcher Settings</h4>
      </section>
      <section className="flex flex-col gap-1 relative size-full p-6 rounded-xl backdrop-blur-sm bg-body/80">
        <h4 className="font-extrabold mb-2">About Launcher</h4>
        <h1 className="text-4xl font-light">PhynariaMC</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium
          maiores commodi error vel maxime animi fuga qui architecto in, iste,
          distinctio culpa quibusdam magni vero similique incidunt tempora
          voluptates laborum?
        </p>
        <span className="mt-auto"></span>
        {/* <p className="text-xs font-light text-white/50 text-center">
          powered by{" "}
          <a
            href="https://cubidron.com"
            target="_blank"
            className="font-medium hover:underline hover:text-primary">
            Cubidron
          </a>
        </p> */}
        <p className="text-xs font-light text-white/50 text-center">
          Not affiliated with Mojang or Microsoft. Minecraft is a trademark of
          Mojang AB.
        </p>
        <span className="flex gap-4 mx-auto">
          <a
            className="text-xs font-light text-white/50 text-center underline hover:text-primary"
            target="_blank"
            href={remote.website}>
            Contact Us
          </a>
          <a
            className="text-xs font-light text-white/50 text-center underline hover:text-primary"
            target="_blank"
            href={remote.website}>
            Report an Issue
          </a>
        </span>
      </section>
    </div>
  );
}
