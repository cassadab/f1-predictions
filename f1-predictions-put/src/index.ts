import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import {
  beginTransaction,
  commitTransaction,
  insertPrediction,
  insertRankings,
  predictionExists,
  removeRankings,
  updatePrediction,
} from './dbService';
import { PutPredictionRequest } from './predictions-put.interfaces';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  const body = JSON.parse(event.body) as PutPredictionRequest;
  const overwrite = await predictionExists(body);

  const transactionId = await beginTransaction();

  if (overwrite) {
    console.log(`Prediction already exists for ${body.discord}. Overwriting`);
    await removeRankings(body, transactionId);
    await updatePrediction(body, transactionId);
  } else {
    await insertPrediction(body, transactionId);
  }

  await Promise.all(insertRankings(body, transactionId));

  console.log('Commiting transaction');
  await commitTransaction(transactionId);

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
