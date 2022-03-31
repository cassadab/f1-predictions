import { RDSDataService } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { ExecuteStatementRequest, FieldList } from 'aws-sdk/clients/rdsdataservice';
import { PredictionRecord } from './f1.interfaces';

const rdsDataService = new RDSDataService();
const DATABASE_NAME = 'f1_predictions';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log(JSON.stringify(event));

  const result = await getStandings();
  const standings = result.records.map(record => parsePrediction(record));

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
    },
    body: JSON.stringify(standings),
  };

  return response as APIGatewayProxyStructuredResultV2;
};

function getStandings() {
  const sqlParams = {
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.CLUSTER_ARN,
    sql: `select discord, name, country, score from predictions
        ORDER BY score`,
    database: DATABASE_NAME,
  } as ExecuteStatementRequest;
  return rdsDataService.executeStatement(sqlParams).promise();
}

function parsePrediction(record: FieldList): PredictionRecord {
  return {
    discord: record[0].stringValue,
    name: record[1].stringValue,
    country: record[2].stringValue,
    score: record[3].longValue,
  } as PredictionRecord;
}
