import { create } from "zustand";
// import { fetch } from "@tauri-apps/plugin-http";

interface IServer {
  icon?: string;
  title?: string;
  profile?: string;
  description?: string;
  version?: string;
  serverName?: string;
  ip?: string;
  port?: number;
  minecraft?: {
    version: string;
    loader: {
      type: string;
      version: string;
    };
    exclude: string[];
  };
  videoUrl?: string;
}

interface IRemote {
  discordRpc?: {
    clientId: string;
    stateText: string;
    largeImage: string;
    largeText: string;
    details: string;
  };
  servers?: IServer[];
  version?: string;
  website?: string;
  notes?: string;
  pub_date?: string;
  platforms?: {
    "windows-x86_64": {
      signature: string;
      url: string;
    };
    "darwin-x86_64": {
      signature: string;
      url: string;
    };
    "darwin-aarch64": {
      signature: string;
      url: string;
    };
    "linux-x86_64": {
      signature: string;
      url: string;
    };
  };
}
interface RemoteStore extends IRemote {
  init: () => Promise<void>;
}

const useRemote = create<RemoteStore>((set) => ({
  init: async () => {
    const response = await fetch("/rem.json");

    if (!response.ok) {
      throw new Error("Could not fetch the data");
    }

    const data = await response.json();

    set({
      ...data
    });
  },
}));
export default useRemote;