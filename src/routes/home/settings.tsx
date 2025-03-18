import { createFileRoute } from "@tanstack/react-router";
import useRemote from "../../store/remote";
import { TLaunchBehavior, useOptions } from "../../store/options";
import Switch from "../../components/Switch";
import { InputRange } from "../../components/InputRange";
import Dropdown from "../../components/Dropdown";
import { start, destroy } from "tauri-plugin-drpc";
import { DISCORD_CLIENT_ID } from "../../constants";
import { initializeDiscordState } from "../../helpers";
import { useState } from "react";
export const Route = createFileRoute("/home/settings")({
  component: RouteComponent,
});
function RouteComponent() {
  const remote = useRemote();
  const options = useOptions();
  const [sysMem, _sysMem] = useState(2); //GigaBytes

  return (
    <>
      <div className="flex gap-2 size-full">
        <section className="flex flex-col relative size-full p-6 gap-4 rounded-xl backdrop-blur-sm bg-body/80">
          <h4 className="font-extrabold mb-2">Paramètres du lanceur</h4>
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs text-white/60">
              Le comportement du lanceur lorsque le jeu démarre
            </p>
            <Dropdown
              options={["close", "keep", "minimize"]}
              id="launcherBehavior"
              value={options.launchBehavior!}
              onChange={(value: TLaunchBehavior) =>
                options.set({ launchBehavior: value })
              }
              displayValue={(option) => {
                const found = [
                  { label: "Garder ouvert", value: "keep" },
                  { label: "Minimiser", value: "minimize" },
                  { label: "Fermer", value: "close" },
                ].find((item) => item.value === option);
                return found ? found.label : option;
              }}
            />
          </div>
          <p className="font-extrabold my-2">Paramètres initiaux en jeu</p>

          <span className="flex h-max gap-1 items-center">
            <p className="text-xs w-full text-white/60">
              Quantité maximale de mémoire.
            </p>
            <p className=" shrink-0 text-xs mr-2">
              {(options.maxMemory! * 512) / 1024} GB
            </p>
            <InputRange
              className=" shrink-0"
              title="Quantité de mémoire"
              min={1}
              max={sysMem * 2}
              value={options.maxMemory!}
              onChange={(e) => {
                options.set({
                  maxMemory: e,
                });
              }}
            />
          </span>
          <hr />
          <span className="flex gap-2 items-center">
            <p className="text-xs w-45 text-white/60">Emplacement de Java.</p>
            <input
              type="text"
              spellCheck={false}
              readOnly
              className="w-full select-none bg-dark text-sm rounded-md px-3 py-1.5 outline-none"
              value={options.javaPath}
            />
          </span>
          <hr />
          <span className="flex justify-between gap-1 items-center">
            <p className="text-xs text-white/60">Minecraft en plein écran.</p>
            <Switch
              value={options.fullScreen!}
              onChange={(e) => options.set({ fullScreen: e })}
            />
          </span>
          <hr />
          <span className="flex justify-between gap-1 items-center">
            <p className="text-xs text-white/60">
              Activer/désactiver RPC Discord.
            </p>
            <Switch
              value={options.discordRpc!}
              onChange={async (e) => {
                options.set({ discordRpc: e });
                if (e) {
                  await start(DISCORD_CLIENT_ID);
                  await initializeDiscordState(remote.discordRpc!);
                } else {
                  await destroy();
                }
              }}
            />
          </span>
        </section>
        <section className="flex flex-col gap-1 relative size-full p-6 rounded-xl backdrop-blur-sm bg-body/80">
          <h4 className="font-extrabold mb-2">À propos du lanceur</h4>
          <h1 className="text-4xl font-light">PhynariaMC</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium
            maiores commodi error vel maxime animi fuga qui architecto in, iste,
            distinctio culpa quibusdam magni vero similique incidunt tempora
            voluptates laborum?
          </p>
        </section>
      </div>
      <section className="flex flex-col relative p-4 rounded-xl backdrop-blur-sm bg-body/80">
        <p className="text-xs font-light text-white/50 text-center">
          Non affilié à Mojang ou Microsoft. Minecraft est une marque déposée de
          Mojang AB.
        </p>
        <span className="flex gap-4 mx-auto">
          <a
            className="text-xs font-light text-white/50 text-center underline hover:text-primary"
            target="_blank"
            href={remote.website}>
            Contactez-nous
          </a>
          <a
            className="text-xs font-light text-white/50 text-center underline hover:text-primary"
            target="_blank"
            href={remote.website}>
            Signaler un problème
          </a>
        </span>
      </section>
    </>
  );
}
