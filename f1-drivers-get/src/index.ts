import { APIGatewayProxyEvent, APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { RDSDataService, } from 'aws-sdk';
import { ExecuteStatementRequest, FieldList } from 'aws-sdk/clients/rdsdataservice';
import { Driver } from './f1.interfaces';

const rdsDataService = new RDSDataService();
const DATABASE_NAME = 'f1_predictions';

export const handler = async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResultV2> => {
    const sqlParams = {
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        sql: `select code,name,team,rank,country from drivers 
            ORDER BY rank is NULL, rank`,
        database: DATABASE_NAME,
    } as ExecuteStatementRequest;
    const result = await rdsDataService.executeStatement(sqlParams).promise();
    
    const parsedRecords = result.records.map((record) => parseRecord(record));
    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify(parsedRecords),
    };
    
    return response;
};

function parseRecord(record: FieldList): Driver {
    return {
        'code': record[0].stringValue,
        'name': record[1].stringValue,
        'team': record[2].stringValue,
        'rank': record[3].longValue || null,
        'country': record[4].stringValue,
    } as Driver;
}
