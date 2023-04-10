import axios from 'axios';
import { StandingsResponse } from '../../types/src';
import { Driver } from '../../types/src';
import { DynamoDB } from 'aws-sdk';
import { TransactWriteItem } from 'aws-sdk/clients/dynamodb';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<void> => {
  const drivers = await getStandings();
  await batchUpdate(drivers);
  console.log('Update complete');
};

async function getStandings(): Promise<Driver[]> {
  console.log('Calling Ergast API');
  const url = `${process.env.ERGAST_BASE_URL}/${process.env.SEASON}/${process.env.ROUND}/driverStandings.json`;
  const apiResult = await axios.get(url);

  const standingsResponse = apiResult.data as StandingsResponse;
  const driverStandings =
    standingsResponse.MRData.StandingsTable.StandingsLists[0].DriverStandings;

  return driverStandings.map(standing => {
    return {
      code: standing.Driver.code,
      score: parseInt(standing.points),
      entityType: `DRIVER${process.env.SEASON.substring(2)}`,
    } as Driver;
  });
}

function buildDynamoParams(standings: Driver[]): TransactWriteItem[] {
  return standings.map(driver => {
    return {
      Update: {
        TableName: TABLE_NAME,
        Key: {
          pk: `DRIVER|${driver.code}`,
          sk: process.env.SEASON,
        },
        UpdateExpression: 'SET #s = :s, #et = :et',
        ExpressionAttributeNames: {
          '#s': 'score',
        },
        ExpressionAttributeValues: {
          ':s': driver.score,
          ':et': driver.entityType,
        },
      },
    } as TransactWriteItem;
  });
}

function batchUpdate(standings: Driver[]) {
  const items = buildDynamoParams(standings);
  console.log('Updating driver standings');
  return dynamo.transactWrite({ TransactItems: items }).promise();
}
