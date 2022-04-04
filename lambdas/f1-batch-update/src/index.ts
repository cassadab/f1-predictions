import axios from 'axios';
import { StandingsResponse } from './ergast.interfaces';
import { Driver } from './f1.interfaces';
import { Lambda } from 'aws-sdk';
import { InvocationRequest } from 'aws-sdk/clients/lambda';

const lambda = new Lambda();

export const handler = async (event: any): Promise<void> => {
  console.log('Calling Ergast API');
  const drivers = await getStandings();

  console.log('Updating driver standings');
  await updateDriverStandings(drivers);

  console.log('Updating prediction scores');
  await updatePredictionScores();

  console.log('Update complete');
};

async function getStandings(): Promise<Driver[]> {
  const url = `${process.env.ERGAST_BASE_URL}/${process.env.SEASON}/${process.env.ROUND}/driverStandings.json`;
  const apiResult = await axios.get(url);

  const standingsResponse = apiResult.data as StandingsResponse;
  const driverStandings = standingsResponse.MRData.StandingsTable.StandingsLists[0].DriverStandings;

  return driverStandings.map(standing => {
    return {
      code: standing.Driver.code,
      rank: parseInt(standing.position),
    } as Driver;
  });
}

async function updatePredictionScores() {
  const params = {
    FunctionName: 'f1-update-prediction-scores',
    InvocationType: 'RequestResponse',
  } as InvocationRequest;

  return lambda.invoke(params).promise();
}

function updateDriverStandings(standings: Driver[]) {
  const params = {
    FunctionName: 'f1-update-driver-standings',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(standings),
  } as InvocationRequest;

  return lambda.invoke(params).promise();
}
