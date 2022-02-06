import { EliminationSettings } from "./EliminationTypes";

export enum GameType {
  Elimination = "elimination",
  oop = ""
}
export type GameInfo = {
  community: string;
  game: GameType;
  start: number;
  end: number;
  id: string;
  name: string;
};
export type GameSettings = EliminationSettings;