import {
  APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Driver } from './f1.interfaces';
const TABLE_NAME = 'beeg-yoshi-f1';
const INDEX_NAME = 'TypeScoreIndex';

const dynamo = new DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const season =
    event.pathParameters && event.pathParameters['season']
      ? decodeURIComponent(event.pathParameters.season)
      : process.env.SEASON;
  const entityType = `DRIVER${season.slice(2)}`;
  const params = {
    TableName: TABLE_NAME,
    IndexName: INDEX_NAME,
    KeyConditionExpression: 'entityType=:et',
    ExpressionAttributeValues: {
      ':et': entityType,
    },
    ScanIndexForward: false,
  };

  const result = await dynamo.query(params).promise();
  if (result.Items) {
    const drivers = result.Items.map(driver => {
      return {
        code: driver.pk,
        season: driver.sk,
        name: driver.name,
        team: driver.team,
        score: driver.score,
        country: driver.country,
      } as Driver;
    });
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
      },
      body: JSON.stringify(drivers),
    };
    return response;
  }
  throw new Error('Unable to retrieve drivers');
};
