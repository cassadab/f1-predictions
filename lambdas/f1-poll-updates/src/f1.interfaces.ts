export interface Driver {
  code: string;
  name: string;
  team: string;
  score: number;
  country: string;
}

export interface PollUpdatesResponse {
  update: boolean;
  standings?: Driver[],
  storedStandings?: Driver[],
}
