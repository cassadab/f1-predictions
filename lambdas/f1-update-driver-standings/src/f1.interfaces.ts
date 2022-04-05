export interface Driver {
  code: string;
  rank: number;
}

export interface UpdateDriversEvent {
  standings: Driver[];
}
