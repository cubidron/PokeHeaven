import Database from "@tauri-apps/plugin-sql";
import { create } from "zustand";

interface IDatabase {
    instance?: Database,
    init: () => Promise<void>;
}

export const useDb = create<IDatabase>((set) => ({
    init: async () => {
        set({
            instance: await Database.load("sqlite:data.db")
        })
    }
}))