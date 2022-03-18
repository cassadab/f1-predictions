import axios from 'axios';
import { StandingsResponse } from './ergast.interfaces';
import { Driver } from './f1.interfaces';
import {
  beginTransaction,
  commitTransaction,
  updateDriverRanks,
} from './dbService';

export const handler = async (event: any): Promise<void> => {
  console.log('Calling Ergast API');
  const drivers = await getStandings();
  console.log(`Drivers: ${JSON.stringify(drivers)}`);
  console.log('Updating database');
  const transactionId = await beginTransaction();
  await updateDriverRanks(drivers, transactionId);
  await commitTransaction(transactionId);
  console.log('Update complete');
};

async function getStandings(): Promise<Driver[]> {
  const url = `${process.env.ERGAST_BASE_URL}/${process.env.SEASON}/${process.env.ROUND}/driverStandings.json`;
  const apiResult = await axios.get(url);

  const standingsResponse = apiResult.data as StandingsResponse;
  const driverStandings =
    standingsResponse.MRData.StandingsTable.StandingsLists[0].DriverStandings;

  return driverStandings.map(standing => {
    return {
      code: standing.Driver.code,
      rank: parseInt(standing.position),
    } as Driver;
  });
}
