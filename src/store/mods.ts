import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { fetch } from "@tauri-apps/plugin-http";
import Alert from "../components/alert";

interface IMods {
  name: string;
  enabled: boolean;
}
interface IModsStore {
  mods: IMods[];
  fetch: () => Promise<void>;
  toggleMod: (id: string) => void;
}

const useMods = create<IModsStore>((set) => ({
  mods: [],
  toggleMod: (name: string) => {
    set((state) => {
      const index = state.mods.findIndex((mod) => mod.name === name);
      state.mods[index].enabled = !state.mods[index].enabled;
      // storage.set("mods", state.mods);
      return { mods: state.mods };
    });
  },
  fetch: async () => {
    try {
      //Get mods from the API
      const mods: any = await invoke("get_mods");

      if (!mods) {
        // set({ mods: await storage.get<IMods[]>("mods") });
        return;
      }

      // const localMods = await storage.get<IMods[]>("mods");
      const localMods = [] as any;
      if (localMods) {
        for (const index in mods) {
          for (const localMod of localMods) {
            mods[index] =
              mods[index].name == localMod.name
                ? {
                  ...mods[index],
                  enabled: localMod.enabled,
                }
                : {
                  ...mods[index],
                };
            // await storage.set("mods", mods);
          }
        }
      } else {
        let localMods = JSON.parse(JSON.stringify(mods));
        for (const index in localMods) {
          localMods[index].enabled = false;
        }

        // await storage.set("mods", localMods);
      }
      set({ mods });
    } catch (_) {
      // Alert({
      //   title: "Error",
      //   message: "There was an error during mod initialization. Please try again or contact with support.",
      // });
    }
  },
}));

export default useMods;
