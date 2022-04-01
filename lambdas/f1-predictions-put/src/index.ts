import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import {
  initConnection,
  insertPrediction,
  insertRankings,
  predictionExists,
  removeRankings,
  updatePrediction,
} from './dbService';
import { PutPredictionRequest } from './predictions-put.interfaces';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  const body = JSON.parse(event.body) as PutPredictionRequest;
  const conn = await initConnection();
  const overwrite = await predictionExists(body, conn);

  if (overwrite) {
    console.log(`Prediction already exists for ${body.discord}. Overwriting`);
    await removeRankings(body, conn);
    await updatePrediction(body, conn);
  } else {
    await insertPrediction(body, conn);
  }

  await Promise.all(insertRankings(body, conn));

  console.log('Commiting transaction');
  await conn.commit();

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
