import axios from 'axios';
import { StandingsResponse } from './ergast.interfaces';
import { Driver } from './f1.interfaces';
import { beginTransaction, commitTransaction, getDiscordIds, updateDriverStandings } from './dbService';
import { Lambda } from 'aws-sdk';
import { InvocationRequest } from 'aws-sdk/clients/lambda';

const lambda = new Lambda();

export const handler = async (event: any): Promise<void> => {
  console.log('Calling Ergast API');
  const drivers = await getStandings();
  const transactionId = await beginTransaction();

  console.log('Updating driver standings');
  await updateDriverStandings(drivers, transactionId);

  console.log('Updating prediction scores');
  await updatePredictionScores(transactionId);

  await commitTransaction(transactionId);
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

async function updatePredictionScores(transactionId: string) {
  const result = await getDiscordIds();
  const ids = result.records.map(record => record[0].stringValue);

  // the scores lambda updates prediction scores
  const updatePromises = ids.map(id => invokeScoresLambda(id, transactionId));

  await Promise.all(updatePromises);
}

function invokeScoresLambda(discordId: string, transactionId: string) {
  const payload = {
    discordId,
    save: true,
    transactionId,
  };

  const params = {
    FunctionName: 'f1-calculate-scores',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(payload),
  } as InvocationRequest;

  return lambda.invoke(params).promise();
}
