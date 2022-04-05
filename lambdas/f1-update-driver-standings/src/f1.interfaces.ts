export interface Driver {
  code: string;
  name: string;
  team: string;
  rank: number;
  country: string;
}

export interface UpdateDriversEvent {
  standings: Driver[]
}
