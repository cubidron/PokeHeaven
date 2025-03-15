import { create } from "zustand";
import { getVersion } from '@tauri-apps/api/app';
import * as path from '@tauri-apps/api/path';
import { storage } from "../routes/__root";

export type TLaunchBehavior = "keep" | "minimize" | "close"

// Local options that launcher will store
interface ILocalOptions {
  maxMemory?: number;
  fullScreen?: boolean;
  launchBehavior?: TLaunchBehavior;
  selectedServer?: string;
  discordRpc?: boolean
}

// Options that will set at runtime
interface IOptions extends ILocalOptions {
  javaPath?: string;
  appDir?: string;
  version?: string;
}
interface IOptionsStore extends IOptions {
  init: () => Promise<void>;
  set: (change: IOptions) => Promise<void>;
}
export const useOptions = create<IOptionsStore>((set) => ({
  init: async () => {
    const options = await storage?.get<ILocalOptions>("options");
    const appDir = await path.join(await path.dataDir(), ".phynaria");

    set({
      version: await getVersion(),
      javaPath: await path.join(appDir, "runtimes"),
      appDir,
      launchBehavior: options?.launchBehavior ?? "keep",
      maxMemory: options?.maxMemory ?? 2,
      fullScreen: options?.fullScreen ?? false,
      selectedServer: options?.selectedServer,
      discordRpc: options?.discordRpc ?? true
    });
  },
  set: async (change: IOptions) => {
    const options = {
      ...useOptions.getState(),
      ...change,
    };

    await storage?.set("options", {
      launchBehavior: options.launchBehavior,
      maxMemory: options.maxMemory,
      fullScreen: options.fullScreen,
      selectedServer: options.selectedServer,
      discordRpc: options.discordRpc
    });

    set(options);
  }
}))