export interface Driver {
  code: string;
  name: string;
  team: string;
  score: number;
  country: string;
}

export interface Prediction {
  discord: string;
  rankings: string[];
}
