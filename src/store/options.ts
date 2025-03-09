import { create } from "zustand";

export type TLaunchBehavior = "keep" | "minimize" | "close"
interface IOptions {
  //Minecraft options
  maxMemory: number;
  javaPath: string;
  fullScreen: boolean;
  gameAgs: string;
  //Launcher Options
  hwa: boolean;
  appDir: string;
  sync: boolean;
  notifications: boolean;
  autoUpdate: boolean;
  launchOnboot: boolean;
  launchBehavior: TLaunchBehavior;
  version: string;
  sendLogs: boolean;
  tel: boolean
}
interface IOptionsStore extends IOptions {
  set: (options: IOptions) => void;

}
export const useOptions = create<IOptionsStore>((set) => ({
  maxMemory: 4,
  javaPath: "%user%/Java/jre20/bin/java.app",
  fullScreen: false,
  gameAgs: "",
  hwa: true,
  appDir: "%user%/Appliations/phynariamc.app",
  sync: true,
  notifications: true,
  version: "1.0.0",
  autoUpdate: true,
  launchOnboot: false,
  launchBehavior: "minimize",
  tel: false,
  sendLogs: true,
  set: (options) => {
    set(options)
  }
}))