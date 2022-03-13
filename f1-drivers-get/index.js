const AWS = require('aws-sdk');
const rdsDataService = new AWS.RDSDataService();
const DATABASE_NAME = 'f1_predictions';

exports.handler = async (event) => {
    const sqlParams = {
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        sql: 'select * from drivers',
        database: DATABASE_NAME,
    };
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

function parseRecord(record) {
    return {
        'id': record[0].longValue,
        'name': record[1].stringValue,
        'team': record[2].stringValue,
        'rank': record[3].longValue || null,
        'coutry': record[4].stringValue,
    };
}
