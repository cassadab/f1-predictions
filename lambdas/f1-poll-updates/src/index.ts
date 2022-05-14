import { DynamoDB } from 'aws-sdk';
import axios from 'axios';
import { StandingsResponse } from './ergast.interfaces';
import { Driver, PollUpdatesResponse } from './f1.interfaces';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (): Promise<PollUpdatesResponse> => {
  const currentStandings = await getStandings();
  const storedStandings = await getStoredStandings();
  storedStandings.sort((a, b) => a.rank - b.rank);

  for (let i = 0; i < storedStandings.length; i++) {
    if (storedStandings[i].rank !== currentStandings[i].rank) {
      return {
        update: true,
        standings: currentStandings,
      } as PollUpdatesResponse;
    }
  }

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
      rank: parseInt(standing.position),
    } as Driver;
  });
}

async function getStoredStandings(): Promise<Driver[]> {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk=:pk',
    ExpressionAttributeValues: {
      ':pk': 'DRIVER',
    },
  };

  const result = await dynamo.query(params).promise();
  if (result.Items) {
    const drivers = result.Items.map(driver => {
      return {
        code: driver.sk,
        name: driver.name,
        team: driver.team,
        rank: driver.standing,
        country: driver.country,
      } as Driver;
    });
    return drivers;
  }
}
