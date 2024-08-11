import { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import {
  EPLPutPredictionRequest,
  F1PutPredictionRequest,
} from './predictions-put.interfaces';
import { DynamoDB } from 'aws-sdk';

const F1_TABLE_NAME = 'beeg-yoshi-f1';
const EPL_TABLE_NAME = 'beeg-yoshi-epl';
const dynamo = new DynamoDB.DocumentClient();

function upsertF1(body: F1PutPredictionRequest) {
  console.log(`Upserting F1 prediction for ${body.discord}`);

  const params = {
    TableName: F1_TABLE_NAME,
    Key: { pk: body.discord, sk: process.env.SEASON },
    UpdateExpression:
      'SET #d = :d, #o = :o, #dnf = :dnf, #n = :n, #r = :r, #et = :et, #c = :c, #s = :s',
    ExpressionAttributeNames: {
      '#d': 'discord',
      '#c': 'country',
      '#o': 'overtake',
      '#dnf': 'dnf',
      '#n': 'name',
      '#r': 'rankings',
      '#et': 'entityType',
      '#s': 'score',
    },
    ExpressionAttributeValues: {
      ':d': body.discord,
      ':c': body.country,
      ':o': body.overtake,
      ':dnf': body.dnf,
      ':n': body.name,
      ':r': body.rankings,
      ':et': `PREDICTION${process.env.SEASON.substring(2)}`,
      ':s': 0,
    },
    ReturnValues: 'ALL_NEW',
  } as UpdateItemInput;
  return dynamo.update(params).promise();
}

function upsertEPL(body: EPLPutPredictionRequest) {
  console.log(`Upserting EPL prediction for ${body.discord}`);

  const params = {
    TableName: EPL_TABLE_NAME,
    Key: { pk: body.discord, sk: process.env.SEASON },
    UpdateExpression:
      'SET #d = :d, #ma = :ma, #mg = :mg, #fsm = :fsm, #n = :n, #r = :r, #et = :et, #c = :c, #s = :s',
    ExpressionAttributeNames: {
      '#d': 'discord',
      '#c': 'country',
      '#ma': 'mostAssists',
      '#mg': 'mostGoals',
      '#fsm': 'firstSackedManager',
      '#n': 'name',
      '#r': 'rankings',
      '#et': 'entityType',
      '#s': 'score',
    },
    ExpressionAttributeValues: {
      ':d': body.discord,
      ':c': body.country,
      ':ma': body.mostAssists,
      ':mg': body.mostGoals,
      ':fsm': body.firstSackedManager,
      ':n': body.name,
      ':r': body.rankings,
      ':et': `PREDICTION${process.env.SEASON.substring(2)}`,
      ':s': 0,
    },
    ReturnValues: 'ALL_NEW',
  } as UpdateItemInput;
  return dynamo.update(params).promise();
}

export { upsertF1, upsertEPL };
