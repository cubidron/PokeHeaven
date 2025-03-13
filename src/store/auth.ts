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
  verifyUser: (user: IUser) => Promise<boolean>;
  findValidUser: (users: IUser[]) => Promise<IUser | undefined>;
}

export const useAuth = create<UserStore>((set, get) => ({
  users: [],
  init: async () => {
    try {
      const userData = await storage?.get<{ all: IUser[]; current?: IUser }>("user");
      if (!userData) {
        addNoti("Error while loading user data. Please try again or contact support.");
        return;
      };

      const { current, all } = userData;

      if (current) {
        if (!(await get().verifyUser(current))) {
          const users = all.filter(user => user.username !== current.username);
          const validUser = await get().findValidUser(users);
          if (validUser) {
            addNoti("Another account is selected because current account is expired or changed.")
            userData.current = validUser;
            userData.all = users;
          } else {
            addNoti("Current account is expired or changed. Please login again.");
            userData.current = undefined;
          }
        }
      }
      await storage?.set("user", userData);
      set({ user: userData.current, users: userData.all });
    } catch (error) {
      addNoti("Error while loading user data. Please try again or contact support.");
    }
  },
  verifyUser: async (user: IUser) => {
    const { request } = await jsonRequest<{
      access_token: string;
      banned: boolean;
      reason: string;
      message: string;
      username: string;
    }>(`${WEB_API_BASE}/verify`, "POST", {
      access_token: user.access_token
    });

    console.log("Verifying user", user, request.status);
    if (request.status !== 200) {
      return false;
    }

    return true;
  },
  findValidUser: async (users: IUser[]) => {
    for (const user of users) {
      console.log("Verifying user", user);
      if (await get().verifyUser(user)) {
        return user;
      }
    }
    return undefined;
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
    if (!(await get().verifyUser(account))) {
      addNoti("This account is expired or banned. Please login with another account.");
      set({ user: undefined });
      return;
    }
    await storage?.set("user", { all: get().users, current: account });
    set({ user: account });
  },

  isLogged: () => get().user !== undefined
}));
