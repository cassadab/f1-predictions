export interface Driver {
  code: string;
  name: string;
  team: string;
  score: number;
  country: string;
  entityType: string;
  season: string;
}

export interface Prediction {
  discord: string;
  entityType: string;
  name: string;
  country: string;
  dnf: string;
  overtake: string;
  rankings: string[];
  season: string;
  score: number;
}
