import {
  APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { GetItemInput } from 'aws-sdk/clients/dynamodb';
import { PredictionsGetResponse } from './predictions-get.interfaces';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const discordId = decodeURIComponent(event.pathParameters.discordId);
  console.log(`Getting prediction for ${discordId}`);

  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: discordId,
      sk: process.env.SEASON,
    },
  } as GetItemInput;
  const result = await dynamo.get(params).promise();
  const item = result.Item;
  if (item) {
    const prediction = {
      discord: item.pk,
      name: item.name,
      country: item.country,
      dnf: item.dnf,
      overtake: item.overtake,
      score: item.score,
      rankings: item.rankings,
    } as PredictionsGetResponse;

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
      },
      body: JSON.stringify(prediction),
    } as APIGatewayProxyStructuredResultV2;
    return response;
  }

  throw new Error('Prediction not found');
};
