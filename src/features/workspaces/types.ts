import { Models } from "node-appwrite";

export type Workspace = Models.Document & {
  name: string;
  imageUrl?: string;
  ImageURL?: string;
  inviteCode: string;
  userid: string;
};
