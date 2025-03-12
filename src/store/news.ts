import { fetch } from "@tauri-apps/plugin-http";
import { create } from "zustand";
import { addNoti } from "../components/notification";

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
    const response = await fetch("https:///cdn.cubidron.com/news.json");

    if (!response.ok) {
      addNoti("Could not fetch news.");
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
