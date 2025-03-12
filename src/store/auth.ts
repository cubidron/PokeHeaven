import { create } from "zustand";
import { WEB_API_BASE } from "../constants";
import { jsonRequest } from "../helpers";
import { addNoti } from "../components/notification";
import { storage } from "../routes/__root";

//SYSTEM AUTH
interface IUser {
  email?: string;
  access_token: string;
  username?: string;
}
interface UserStore {
  user?: IUser
  users: IUser[]
  init: () => Promise<void>;
  login: (user: {
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: (user: IUser) => Promise<void>;
  switch: (account: IUser) => void;
  isLogged: () => boolean;
}

export const useAuth = create<UserStore>((set, get) => ({
  users: [],
  init: async () => {
    try {
      const userData = await storage?.get<{ all: IUser[]; current: IUser }>("user");
      if (!userData) return;

      const { current, all } = userData;

      if (current) {
        const { data, request } = await jsonRequest<{
          access_token: string;
          banned: boolean;
          reason: string;
          message: string;
          username: string;
        }>(`${WEB_API_BASE}/verify`, "POST", {
          access_token: current.access_token
        });

        if (data.access_token) {
          userData.current = {
            username: data.username,
            access_token: data.access_token
          };
        } else {
          console.log({ data, request});
        }
      }
      await storage?.set("user", userData);
      set({ user: userData.current, users: all });
    } catch (error) {
      addNoti("Error while loading user data. Please try again or contact support.");
    }
  },

  login: async ({ email, password }) => {
    try {
      const { data, request } = await jsonRequest<{
        access_token: string;
        banned: boolean;
        reason: string;
        message: string;
        username: string;
      }>(`${WEB_API_BASE}/authenticate`, "POST", { email, password });

      if (request.status !== 200) {
        addNoti(data.reason === "invalid_credentials"
          ? "Invalid credentials"
          : "Authentication error. Please try again or contact support.");
        return false;
      }

      const newUser = { email, access_token: data.access_token, username: data.username };
      const allUsers = [...get().users.filter(user => user.email !== newUser.email), newUser];

      await storage?.set("user", { all: allUsers, current: newUser });
      set({ user: newUser, users: allUsers });
      return true;
    } catch {
      return false;
    }
  },

  logout: async (user) => {
    const { users, user: currentUser } = get();
    const all = users.filter(u => u.username !== user.username);
    const current = currentUser?.username === user.username ? all[0] : currentUser;

    await jsonRequest(`${WEB_API_BASE}/logout`, "POST", { access_token: user.access_token });
    await storage?.set("user", { all, current });
    set({ user: current, users: all });
  },

  switch: async (account) => {
    await storage?.set("user", { all: get().users, current: account });
    set({ user: account });
  },

  isLogged: () => get().user !== undefined
}));
