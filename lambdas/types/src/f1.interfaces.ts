export interface Driver {
  code: string;
  score: number;
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
