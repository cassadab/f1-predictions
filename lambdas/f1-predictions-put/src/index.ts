import {
  APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { upsertPrediction } from './dbService';
import { PutPredictionRequest } from './predictions-put.interfaces';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(event.body);
  const body = JSON.parse(event.body) as PutPredictionRequest;

  try {
    await upsertPrediction(body);
  } catch (error) {
    console.log('ERR: ' + JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,PUT',
      },
    };
  }

  const response = {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,PUT',
    },
    body: JSON.stringify(body),
  };

  return response;
};
