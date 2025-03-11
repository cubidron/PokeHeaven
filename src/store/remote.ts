import { create } from "zustand";
// import { fetch } from "@tauri-apps/plugin-http";

interface IPreset {
  folderName: string;
  name: string;
  description: string;
}

interface IRemote {
  exclude: string[];
  updateZipLink: string;
  updateVersion: string;
  gameVersion: string;
  modApi: string;
  modApiVersion: string;
  serverIp: string;
  serverPort: number;
  memory: {
    min: number;
    max: number;
  };
  discordRpc: {
    clientId: string;
    stateText: string;
    largeImage: string;
    largeText: string;
    details: string;
    buttons: any[];
  };
  videoUrl: string;
  presets: IPreset[];
  version: string;
  title: string;
  description: string;
  website: string;
}
interface RemoteStore extends IRemote {
  init: () => Promise<void>;
}

const useRemote = create<RemoteStore>((set) => ({
  exclude: [],
  updateZipLink: "",
  updateVersion: "",
  gameVersion: "",
  modApi: "",
  modApiVersion: "",
  serverIp: "",
  videoUrl: "",
  serverPort: 0,
  memory: {
    min: 4096,
    max: 8192,
  },
  presets: [],
  discordRpc: {
    clientId: "",
    stateText: "",
    largeImage: "",
    largeText: "",
    details: "",
    buttons: [],
  },
  version: "",
  description: "",
  title: "",
  website: "",
  init: async () => {
    const response = await fetch("/rem.json");

    if (!response.ok) {
      throw new Error("Could not fetch the data");
    }

    const data = await response.json();

    set({
      ...data,
      presets: [...data.presets, {
        name: "Advanced",
        description:
          "Allow you to change settings on your own.",
        folderName: "advanced",
      }]
    });
  },
}));
export default useRemote;