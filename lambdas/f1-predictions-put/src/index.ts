import {
  APIGatewayProxyEvent,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { upsertEPL, upsertF1 } from './dbService';
import {
  F1PutPredictionRequest,
  EPLPutPredictionRequest,
} from './predictions-put.interfaces';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(event.body);

  if (event.path.startsWith('/epl')) {
    const body = JSON.parse(event.body) as EPLPutPredictionRequest;
    try {
      await upsertEPL(body);
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
  }

  const body = JSON.parse(event.body) as F1PutPredictionRequest;
  try {
    await upsertF1(body);
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
