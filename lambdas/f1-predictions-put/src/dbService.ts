import { AWSError, RDSDataService } from 'aws-sdk';
import {
  BeginTransactionRequest,
  CommitTransactionRequest,
  CommitTransactionResponse,
  ExecuteStatementRequest,
  FieldList,
} from 'aws-sdk/clients/rdsdataservice';
import { PromiseResult } from 'aws-sdk/lib/request';
import { PutPredictionRequest } from './predictions-put.interfaces';

const rdsDataService = new RDSDataService();
const DATABASE_NAME = 'f1_predictions';

async function beginTransaction(): Promise<string> {
  const transaction = await rdsDataService
    .beginTransaction({
      secretArn: process.env.SECRET_ARN,
      resourceArn: process.env.CLUSTER_ARN,
      database: DATABASE_NAME,
    } as BeginTransactionRequest)
    .promise();

  return transaction.transactionId;
}

function commitTransaction(transactionId: string): Promise<PromiseResult<CommitTransactionResponse, AWSError>> {
  return rdsDataService
    .commitTransaction({
      secretArn: process.env.SECRET_ARN,
      resourceArn: process.env.CLUSTER_ARN,
      transactionId: transactionId,
    } as CommitTransactionRequest)
    .promise();
}

async function insertPrediction(body: PutPredictionRequest, transactionId: string) {
  console.log(`Inserting prediction for ${body.discord}`);
  await rdsDataService
    .executeStatement({
      secretArn: process.env.SECRET_ARN,
      resourceArn: process.env.CLUSTER_ARN,
      database: DATABASE_NAME,
      transactionId: transactionId,
      sql:
        'INSERT INTO predictions (discord,name,country,dnf,overtake,score) VALUES(:discord,:name,:country,:dnf,:overtake, :score)',
      parameters: [
        { name: 'discord', value: { stringValue: body.discord } },
        { name: 'name', value: { stringValue: body.name } },
        { name: 'country', value: { stringValue: body.country } },
        { name: 'dnf', value: { stringValue: body.dnf } },
        { name: 'overtake', value: { stringValue: body.overtake } },
        { name: 'score', value: { longValue: 0 } },
      ],
    } as ExecuteStatementRequest)
    .promise();
}

function insertRankings(body: PutPredictionRequest, transactionId: string) {
  console.log(`Inserting rankings for ${body.discord}`);
  return body.rankings.map((ranking, index) => {
    console.log(ranking);
    return rdsDataService
      .executeStatement({
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: DATABASE_NAME,
        transactionId,
        sql: 'INSERT INTO rankings (prediction_id,driver,rank) VALUES(:prediction_id,:driver,:rank)',
        parameters: [
          { name: 'prediction_id', value: { stringValue: body.discord } },
          { name: 'driver', value: { stringValue: ranking } },
          { name: 'rank', value: { longValue: index + 1 } },
        ],
      } as ExecuteStatementRequest)
      .promise();
  });
}

async function predictionExists(body: PutPredictionRequest): Promise<boolean> {
  const sqlParams = {
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.CLUSTER_ARN,
    sql: 'SELECT discord from predictions WHERE discord=:discord',
    database: DATABASE_NAME,
    parameters: [{ name: 'discord', value: { stringValue: body.discord } }],
  } as ExecuteStatementRequest;
  const result = await rdsDataService.executeStatement(sqlParams).promise();
  console.log(`Predictions get: ${JSON.stringify(result)}`);
  return result.records.length > 0;
}

async function removeRankings(body: PutPredictionRequest, transactionId: string) {
  console.log(`Removing existing rankings for ${body.discord}`);
  const sqlParams = {
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.CLUSTER_ARN,
    sql: 'DELETE FROM rankings WHERE prediction_id=:discord',
    database: DATABASE_NAME,
    transactionId: transactionId,
    parameters: [{ name: 'discord', value: { stringValue: body.discord } }],
  } as ExecuteStatementRequest;
  await rdsDataService.executeStatement(sqlParams).promise();
}

function updatePrediction(body: PutPredictionRequest, transactionId: string) {
  console.log(`Updating prediction for ${body.discord}`);
  return rdsDataService
    .executeStatement({
      secretArn: process.env.SECRET_ARN,
      resourceArn: process.env.CLUSTER_ARN,
      database: DATABASE_NAME,
      transactionId,
      sql: 'UPDATE predictions SET dnf=:dnf, overtake=:overtake WHERE discord=:discord',
      parameters: [
        { name: 'discord', value: { stringValue: body.discord } },
        { name: 'dnf', value: { stringValue: body.dnf } },
        { name: 'overtake', value: { stringValue: body.overtake } },
      ],
    } as ExecuteStatementRequest)
    .promise();
}

export {
  beginTransaction,
  commitTransaction,
  insertPrediction,
  insertRankings,
  predictionExists,
  removeRankings,
  updatePrediction,
};
