import {
  APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { Team } from './epl.interfaces';
const TABLE_NAME = 'beeg-yoshi-epl';
const INDEX_NAME = 'TypeScoreIndex';

const dynamo = new DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const season =
    event.pathParameters && event.pathParameters['season']
      ? decodeURIComponent(event.pathParameters.season)
      : process.env.SEASON;
  const entityType = `TEAM${season.slice(2)}`;
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
    const teams = result.Items.map(team => {
      return {
        name: team.pk,
        season: team.sk,
        score: team.score,
      } as Team;
    });
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
      },
      body: JSON.stringify(teams),
    };
    return response;
  }
  throw new Error('Unable to retrieve teams');
};
