import { DynamoDB } from 'aws-sdk';
import axios from 'axios';
import { StandingsResponse } from './ergast.interfaces';
import { Driver, PollUpdatesResponse } from './f1.interfaces';
import { QueryInput } from 'aws-sdk/clients/dynamodb';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (): Promise<PollUpdatesResponse> => {
  const currentStandings = await getStandings();
  const storedStandings = await getStoredStandings();

  const standingMap: { [key: string]: number } = {};
  currentStandings.forEach((driver) => {
    standingMap[driver.code] = driver.score;
  });

  storedStandings.forEach((driver) => {
    if (standingMap[driver.code] !== driver.score) {
      return {
        update: true,
        standings: currentStandings,
        storedStandings: storedStandings,
      } as PollUpdatesResponse
    }
  });

  return {
    update: false,
  } as PollUpdatesResponse;
};

async function getStandings(): Promise<Driver[]> {
  console.log('Calling Ergast API');
  const url = 'http://ergast.com/api/f1/current/driverStandings.json';
  const apiResult = await axios.get(url);

  const standingsResponse = apiResult.data as StandingsResponse;
  const driverStandings = standingsResponse.MRData.StandingsTable.StandingsLists[0].DriverStandings;

  return driverStandings.map(standing => {
    return {
      code: standing.Driver.code,
      score: parseInt(standing.points),
    } as Driver;
  });
}

async function getStoredStandings(): Promise<Driver[]> {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'TypeScoreIndex',
    KeyConditionExpression: 'entityType=:et',
    ExpressionAttributeValues: {
      ':et': 'PREDICTION23',
    },
    ScanIndexForward: false,
  } as QueryInput;
  
  const result = await dynamo.query(params).promise();
  if (result.Items) {
    const drivers = result.Items.map(driver => {
      const pk = driver.pk as string
      return {
        code: pk.split("|")[1],
        name: driver.name,
        team: driver.team,
        score: driver.score,
        country: driver.country,
      } as Driver;
    });
    return drivers;
  }
}
