import { fetch } from "@tauri-apps/plugin-http";
import { create } from "zustand";
import { addNoti } from "../components/notification";
import { LAUNCHER_BASE } from "../constants";

interface News {
  link: string;
  lore: string;
  image: string;
  title: string;
}
interface NewsStore {
  newses: News[];
  fetch: () => Promise<void>;
}

const useNewses = create<NewsStore>((set) => ({
  newses: [],
  fetch: async () => {
    const response = await fetch(`${LAUNCHER_BASE}/news.json`);

    if (!response.ok) {
      addNoti("Impossible de récupérer les actualités.");
      return;
    }

    const news = await response.json();

    if (news) {
      set({ newses: news });
      return;
    }
  },
}));

export default useNewses;
