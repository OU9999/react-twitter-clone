import { User } from "firebase/auth";
import { atom } from "recoil";

export const userObjAtom = atom<User | null>({
  key: "userObj",
  default: null,
});
