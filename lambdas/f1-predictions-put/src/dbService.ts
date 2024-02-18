import { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { PutPredictionRequest } from './predictions-put.interfaces';
import { DynamoDB } from 'aws-sdk';

const TABLE_NAME = 'beeg-yoshi-f1';
const dynamo = new DynamoDB.DocumentClient();

function upsertPrediction(body: PutPredictionRequest) {
  console.log(`Upserting prediction for ${body.discord}`);

  const params = {
    TableName: TABLE_NAME,
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

export { upsertPrediction };
