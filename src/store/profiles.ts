import { create } from "zustand";

interface IMod {

}
interface IProfile {
  id: number;
  name: string;
  description: string;
  general: string; //MD Format MarkDown
  details: {
    mods: IMod[];
    //Resourcepack gibi daha gelecek  //!GELİŞTİRİLME AŞAMASINDA
  }
}

interface IProfileStore extends IProfile {
  subscribe: () => void;
  unsubscribe: () => void
}

export const useProfiles = create<IProfileStore>()