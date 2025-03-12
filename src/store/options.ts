import { create } from "zustand";

export type TLaunchBehavior = "keep" | "minimize" | "close"
interface IOptions {
  //Minecraft options
  maxMemory: number;
  javaPath: string;
  fullScreen: boolean;
  //Launcher Options
  appDir: string;
  launchBehavior: TLaunchBehavior;
  version: string;
}
interface IOptionsStore extends IOptions {
  set: (options: IOptions) => void;

}
export const useOptions = create<IOptionsStore>((set) => ({
  maxMemory: 4,
  javaPath: "%user%/Java/jre20/bin/java.app",
  fullScreen: false,
  appDir: "%user%/Appliations/phynariamc.app",
  version: "1.0.0",
  launchBehavior: "minimize",
  set: (options) => {
    set(options)
  }
}))