import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Switch from "./Switch";
import useRemote, { IOptionalMod } from "../store/remote";
import { useOptions } from "../store/options";

export default function Mods({
  show,
  close,
  mods,
}: {
  show: boolean;
  close: () => void;
  mods: IOptionalMod[];
}) {
  const [loading, setLoading] = useState(false);
  const remote = useRemote();
  const options = useOptions();

  const handleSwitchChange = (mod: IOptionalMod) => {
    const currentServer =
      remote.servers?.find((s) => s.profile === options.selectedServer) ||
      remote.servers?.[0]!;

    currentServer.minecraft?.optionalMods?.forEach((m) => {
      if (m.fileName === mod.fileName) {
        m.enabled = !m.enabled;
      }
    });

    let optionalMods =
      currentServer.minecraft?.optionalMods?.map((m) => ({
        fileName: m.fileName,
        enabled: m.enabled!,
        profile: options.selectedServer!,
      })) || [];

    optionalMods = optionalMods.concat(
      options.optionalMods?.filter(
        (m) => m.profile !== options.selectedServer
      ) || []
    );

    options.set({ optionalMods });
  };

  return (
    <AnimatePresence mode="popLayout">
      {show && (
        <span className="fixed bottom-0 right-0 size-full z-50">
          <motion.span
            onClick={close}
            className="fixed inset-0 grid place-items-center backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[44rem] h-max max-h-[36rem] min-h-48 p-4 bg-body text-white shadow-2xl shadow-black/60 rounded-xl flex flex-col">
              <h1 className="text-xl leading-3 flex items-center justify-between font-medium">
                Mods Optionnels
                <button
                  onClick={async () => {
                    setLoading(true);
                    // await mods.fetch(); // Décommentez et implémentez cette ligne si nécessaire
                    setLoading(false);
                  }}
                  className="w-6 h-6 bg-body hover:bg-primary ease-in-out duration-300 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className={loading ? "animate-spin" : ""}>
                    <path
                      fill="currentColor"
                      d="M12.077 19q-2.931 0-4.966-2.033q-2.034-2.034-2.034-4.964t2.034-4.966T12.077 5q1.783 0 3.339.847q1.555.847 2.507 2.365V5.5q0-.213.144-.356T18.424 5t.356.144t.143.356v3.923q0 .343-.232.576t-.576.232h-3.923q-.212 0-.356-.144t-.144-.357t.144-.356t.356-.143h3.2q-.78-1.496-2.197-2.364Q13.78 6 12.077 6q-2.5 0-4.25 1.75T6.077 12t1.75 4.25t4.25 1.75q1.787 0 3.271-.968q1.485-.969 2.202-2.573q.085-.196.274-.275q.19-.08.388-.013q.211.067.28.275t-.015.404q-.833 1.885-2.56 3.017T12.077 19"
                    />
                  </svg>
                </button>
              </h1>
              <ul className="flex mt-4 gap-2 overflow-y-auto pr-2 max-h-full w-full flex-col">
                {mods && mods.length > 0 ? (
                  mods.map((mod, i) => (
                    <div
                      key={i}
                      className={`w-full flex items-center p-2 gap-4 rounded-lg ${i % 2 === 0 ? "bg-white/5" : "bg-white/10"}`}>
                      <div className="h-10 w-10 grid place-items-center aspect-square rounded bg-body">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6"
                          viewBox="0 0 16 16">
                          <path
                            fill="none"
                            className={`ease-in-out duration-300 origin-center ${mod.enabled ? "stroke-primary scale-100" : "stroke-primary mix-blend-luminosity scale-[0.85]"}`}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.625 1.5H14.5v4.875H9.625ZM1.5 9.625h4.875V14.5H1.5Zm8.125 2.438a2.438 2.437 0 1 0 4.875 0a2.438 2.437 0 1 0-4.875 0M1.5 3.938a2.438 2.437 0 1 0 4.875 0a2.438 2.437 0 1 0-4.875 0"
                          />
                        </svg>
                      </div>
                      <p>{mod.name.replace(".ignored", "")}</p>
                      <Switch
                        className={`ml-auto ${mod.enabled || (i % 2 === 0 ? "bg-white/10" : "bg-white/5")}`}
                        value={mod.enabled!}
                        onChange={() => handleSwitchChange(mod)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-white/60">Aucun mod trouvé</p>
                )}
              </ul>
            </div>
          </motion.span>
        </span>
      )}
    </AnimatePresence>
  );
}
