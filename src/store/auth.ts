import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core"
import Alert from "../components/alert";
import { useDb } from "./db";

//MOJANG AUTH
// interface MinecraftAccount {
//   username?: string;
//   uuid?: string;
//   access_token?: string;
//   refresh_token?: string;
//   xuid?: string;
//   exp?: number;
// }
// interface UserStore {
//   minecraftAccount?: MinecraftAccount;
//   minecraftAccounts: MinecraftAccount[];
//   init: () => Promise<void>;
//   add: () => Promise<void>;
//   remove: (account: MinecraftAccount) => Promise<void>;
//   switch: (account: MinecraftAccount) => void;
// }

// export const useAuth = create<UserStore>((set) => ({
//   minecraftAccounts: [],
//   init: async () => {
//     const db = useDb.getState().instance!;
//     const result: MinecraftAccount[] = await db.select(`SELECT * FROM accounts`);
//     const lastAccount = localStorage.getItem("lastAccount");
//     const currentAccount = lastAccount
//       ? result.find(a => a.uuid === lastAccount) : result.length > 0
//         ? result[0] : undefined;

//     set({
//       minecraftAccount: currentAccount,
//       minecraftAccounts: result
//     });
//   },
//   add: async () => {
//     try {
//       const account: MinecraftAccount = await invoke("authenticate");
//       const { minecraftAccounts: accounts } = useAuth.getState();
//       const existingIndex = accounts.findIndex(a => a.uuid === account.uuid);

//       if (existingIndex !== -1 && accounts) {
//         accounts[existingIndex] = account;
//         set({ minecraftAccount: account, minecraftAccounts: accounts });
//         return;
//       }

//       const db = useDb.getState().instance!;
//       const result = await db.execute(
//         `INSERT INTO accounts (username, access_token, refresh_token, uuid, exp) 
//        VALUES ($1, $2, $3, $4, $5)`,
//         [account.username, account.access_token, account.refresh_token, account.uuid, account.exp]
//       );

//       if (!result.rowsAffected) {
//         return Alert({
//           title: "Oh no!",
//           message: "There was an error during authentication. Please try again later."
//         });
//       }

//       set({
//         minecraftAccount: account,
//         minecraftAccounts: [...accounts ?? [], account]
//       });
//     } catch (error) {
//       console.error(error);
//       if (error === "Account does not own Minecraft.") {
//         return Alert({
//           title: "Oh no!",
//           message: "This account does not own Minecraft.",
//           force: true,
//           action: () => { useAuth.getState().add() }
//         });
//       }
//       else if (error === "Authentication channel closed unexpectedly") {
//         return;
//       }
//       return Alert({
//         title: "Oh no!",
//         message: "There was an error during authentication. Please try again later."
//       });
//     }
//   },
//   remove: async (account: MinecraftAccount) => {
//     const state = useAuth.getState();
//     const db = useDb.getState().instance!;

//     try {
//       const result = await db.execute(`DELETE FROM accounts WHERE uuid = $1`,
//         [account.uuid]
//       );

//       if (result.rowsAffected === 0) {
//         return Alert({
//           title: "Oh no!", message: `There was an error during account removal. Please try again later.`
//         });
//       }

//       const currentAccount = state.minecraftAccounts?.find((a) => a.uuid !== account.uuid);
//       localStorage.setItem("lastAccount", currentAccount?.uuid!);

//       set({
//         minecraftAccount: currentAccount,
//         minecraftAccounts: state.minecraftAccounts?.filter((a) => a.uuid !== account.uuid)
//       })
//     } catch (error) {
//       return Alert({
//         title: "Oh no!", message: `There was an error during account removal. Please try again later.`
//       });
//     }
//   },
//   switch: (account: MinecraftAccount) => {
//     localStorage.setItem("lastAccount", account.uuid!);
//     set({
//       minecraftAccount: account
//     })
//   }
// }))

//SYSTEM AUTH
interface IUser {
  username?: string;
  mail?: string;
  password?: string;
}
interface UserStore {
  user?: IUser
  users: IUser[]
  init: () => Promise<void>;
  login: (user: IUser) => Promise<void>;
  logout: (user: IUser) => Promise<void>;
  switch: (account: IUser) => void;
}

export const useAuth = create<UserStore>((set, state) => ({
  users: [],
  init: async () => { },
  login: async (user) => {
    set({
      user: user,
      users: [...state().users, user]
    })
  },
  logout: async (user) => {
    let newlist = state().users.filter(u => u.username !== user.username)
    if (newlist.length > 0) {
      set({
        user: newlist[0],
        users: newlist
      })
    } else {
      set({
        user: undefined,
        users: newlist
      })
    }
  },
  switch: (account: IUser) => {
    set({
      user: account
    })
  }
}))