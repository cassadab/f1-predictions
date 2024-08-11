export interface F1PutPredictionRequest {
  discord: string;
  name: string;
  country: string;
  dnf: string;
  overtake: string;
  rankings: string[];
}

export interface EPLPutPredictionRequest {
  discord: string;
  name: string;
  country: string;
  rankings: string[];
  mostGoals: string;
  mostAssists: string;
  firstSackedManager: string;
}
