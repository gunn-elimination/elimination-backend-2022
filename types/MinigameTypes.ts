import { EliminationSettings } from "./EliminationTypes";

export enum GameType {
  Elimination = "elimination",
  oop = "",
}
export type GameInfo = {
  game: GameType;
  start: number;
  end: number;
  id: string;
  name: string;
  description: string;
  dev?: boolean;
};
export type GameAnnouncement = {
  game: string;
  time: number;
  message: string;
  userID: string;
};
export type GameSettings = EliminationSettings;
