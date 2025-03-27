import { create } from "zustand";
import { MOJANG_API, MOJANG_SESSION_SERVICE } from "../constants";
import { addNoti } from "../components/notification";
import { storage } from "../routes/__root";
import { error } from "@tauri-apps/plugin-log";
import { fetch } from "@tauri-apps/plugin-http";
import { invoke } from "@tauri-apps/api/core";
import { clearLoading, setLoading } from "../components/loading";
import Alert from "../components/alert";

//SYSTEM AUTH
interface IUser {
  username?: string;
  uuid?: string;
  access_token?: string;
  refresh_token?: string;
  xuid?: string;
  exp?: number;
}
interface UserStore {
  user?: IUser
  users: IUser[]
  init: () => Promise<void>;
  login: () => Promise<boolean>;
  logout: (user: IUser) => Promise<void>;
  switch: (account: IUser) => void;
  isLogged: () => boolean;
  verifyUser: (user: IUser) => Promise<IUser | null>;
  fetchSkin: (uuid: String) => Promise<string | null>;
  updateSkin: (access_token: string, skin: Blob) => Promise<void>;
}

export const useAuth = create<UserStore>((set, get) => ({
  users: [],
  init: async () => {
    try {
      let userData = await storage?.get<{ all: IUser[]; current?: IUser }>("user");
      if (!userData) {
        userData = { all: [], current: undefined };
        await storage?.set("user", userData);
      };

      if (userData.current) {
        const verified = await get().verifyUser(userData.current);
        if (verified) {
          userData.current = verified;
          userData.all.map(async user => {
            if (user.uuid === verified.uuid) {
              user = verified;
            }

            return user;
          });
        }
      }
      await storage?.set("user", userData);
      set({ user: userData.current, users: userData.all });
    } catch (e: any) {
      error(typeof e === "string" ? e : e.message);
      addNoti("Error while loading user data. Please try again or contact support.");
    }
  },
  verifyUser: async (user: IUser) => {
    setLoading("Please wait!", "Verifying user...");
    const newAccount = await invoke("verify", { exp: user.exp, refreshToken: user.refresh_token });
    clearLoading();
    return newAccount ? newAccount : null;
  },
  login: async () => {
    try {
      const account: IUser = await invoke("authenticate");
      const allUsers = [...get().users.filter(user => user.uuid !== account.uuid), account];

      await storage?.set("user", { all: allUsers, current: account });
      set({ user: account, users: allUsers });
      return true;
    } catch (error) {
      console.error(error);
      if (error === "Account does not own Minecraft.") {
        Alert({
          title: "Oh non!",
          message: "Ce compte ne possède pas Minecraft.",
          force: true,
          action: () => { get().login() }
        });
        return false;
      }
      else if (error === "Authentication channel closed unexpectedly") {
        return false;
      }
      Alert({
        title: "Oh non!",
        message: "Une erreur s'est produite lors de l'authentification. Veuillez réessayer plus tard."
      });

      return false;
    }
  },

  logout: async (user) => {
    const { users, user: currentUser } = get();
    const all = users.filter(u => u.username !== user.username);
    const current = currentUser?.username === user.username ? all[0] : currentUser;
    await storage?.set("user", { all, current });
    set({ user: current, users: all });
  },

  switch: async (account) => {
    const verified = await get().verifyUser(account);
    const newAcc = verified ? verified : account;
    const all = get().users.map(user => {
      if (user.uuid === newAcc.uuid) {
        return newAcc;
      }
      return user;
    });
    await storage?.set("user", { all, current: newAcc });
    set({ user: newAcc, users: all });
  },

  isLogged: () => get().user !== undefined,
  fetchSkin: async (uuid) => {
    const info = await fetch(`${MOJANG_SESSION_SERVICE}/session/minecraft/profile/${uuid}`);

    if (info.status !== 200) {
      Alert({
        title: "Erreur", message: "Échec de la récupération de la skin"
      });

      return null;
    }

    const data: {
      id: string,
      name: string,
      properties:
      {
        name: string,
        value: string
      }[]
    } = await info.json();

    if (data.properties) {
      const base64 = data.properties[0].value;
      console.log(atob(base64));
      const skinData: {
        timestamp: number,
        profileId: string,
        profileName: string,
        textures: {
          SKIN: {
            url: string
          },
          CAPE: {
            url: string
          }
        }
      } = JSON.parse(atob(base64));

      return skinData.textures.SKIN.url;
    }

    return null;
  },
  updateSkin: async (access_token, skin) => {
    const formData = new FormData();
    formData.append("variant", "classic");
    formData.append("file", skin, "skin.png");

    const response = await fetch(`${MOJANG_API}/minecraft/profile/skins`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`
      },
      body: formData
    });

    console.log(response);
    
  }
}));
