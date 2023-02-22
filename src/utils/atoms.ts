import { atom } from "recoil";

export const modalEdit = atom<boolean>({
  key: "modaledit",
  default: false,
});

export const profileEditAtom = atom<boolean>({
  key: "profileEdit",
  default: false,
});

export interface ITweetUserObj {
  id: string;
  attachmentUrl: string | null;
  createdAt: number;
  creatorId: string;
  text: string;
}

export const layoutIdAtom = atom<string>({
  key: "layoutid",
  default: "new",
});

export const tweetUserObjAtom = atom<ITweetUserObj>({
  key: "tweetUserObj",
  default: {
    id: "1",
    attachmentUrl: null,
    createdAt: 0,
    creatorId: "1",
    text: "1",
  },
});
