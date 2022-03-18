import { AWSError, RDSDataService } from 'aws-sdk';
import { Field } from 'aws-sdk/clients/cloudwatchlogs';
import {
  BatchExecuteStatementRequest,
  BatchExecuteStatementResponse,
  BeginTransactionRequest,
  CommitTransactionRequest,
  CommitTransactionResponse,
  ExecuteStatementRequest,
  FieldList,
  SqlParameter,
  SqlParameterSets,
} from 'aws-sdk/clients/rdsdataservice';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Driver } from './f1.interfaces';

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

function commitTransaction(
  transactionId: string,
): Promise<PromiseResult<CommitTransactionResponse, AWSError>> {
  return rdsDataService
    .commitTransaction({
      secretArn: process.env.SECRET_ARN,
      resourceArn: process.env.CLUSTER_ARN,
      transactionId: transactionId,
    } as CommitTransactionRequest)
    .promise();
}

function updateDriverRanks(
  driverRanks: Driver[],
  transactionId: string,
): Promise<PromiseResult<BatchExecuteStatementResponse, AWSError>> {
  const parameters = driverRanks.map(driver => {
    return [
      { name: 'code', value: { stringValue: driver.code } },
      { name: 'rank', value: { longValue: driver.rank } },
    ];
  });
  const params = {
    secretArn: process.env.SECRET_ARN,
    resourceArn: process.env.CLUSTER_ARN,
    database: DATABASE_NAME,
    sql: `update drivers set rank=:rank
        WHERE code=:code`,
    parameterSets: parameters,
  } as BatchExecuteStatementRequest;
  console.log(JSON.stringify(parameters));
  return rdsDataService.batchExecuteStatement(params).promise();
}

export { beginTransaction, commitTransaction, updateDriverRanks };
